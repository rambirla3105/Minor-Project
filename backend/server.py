from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ========== Models ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password: str
    role: str = "user"  # user or admin
    totalScore: int = 0
    badges: List[str] = []
    completedArticles: List[str] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    totalScore: int
    badges: List[str]
    completedArticles: List[str]

class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    articleNumber: int
    institution: str  # Legislature, Executive, Judiciary
    originalText: str
    simplifiedText: str
    example: str
    difficulty: str  # Easy, Medium, Hard
    language: str = "en"  # en or hi
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ArticleCreate(BaseModel):
    articleNumber: int
    institution: str
    originalText: str
    simplifiedText: str
    example: str
    difficulty: str
    language: str = "en"

class ArticleResponse(BaseModel):
    id: str
    articleNumber: int
    institution: str
    originalText: str
    simplifiedText: str
    example: str
    difficulty: str
    language: str

class SimplifyRequest(BaseModel):
    text: str
    language: str = "en"  # en or hi

class GameAttempt(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    articleId: str
    gameType: str  # spin-wheel, snake-ladder, card-game
    score: int
    isCorrect: bool
    timeTaken: int  # in seconds
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GameAttemptCreate(BaseModel):
    articleId: str
    gameType: str
    score: int
    isCorrect: bool
    timeTaken: int

class GameAttemptResponse(BaseModel):
    id: str
    userId: str
    articleId: str
    gameType: str
    score: int
    isCorrect: bool
    timeTaken: int

class AnalyticsResponse(BaseModel):
    totalArticles: int
    completedArticles: int
    totalScore: int
    accuracy: float
    badges: List[str]
    institutionWiseStrength: dict
    recentAttempts: List[dict]

# ========== Helper Functions ==========

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ========== Auth Routes ==========

@api_router.post("/auth/register")
async def register(user_input: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_input.password)
    
    # Create user
    user_dict = user_input.model_dump()
    user_obj = User(**user_dict)
    user_obj.password = hashed_password
    
    doc = user_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user_obj.id})
    
    return {
        "token": access_token,
        "user": UserResponse(
            id=user_obj.id,
            name=user_obj.name,
            email=user_obj.email,
            role=user_obj.role,
            totalScore=user_obj.totalScore,
            badges=user_obj.badges,
            completedArticles=user_obj.completedArticles
        )
    }

@api_router.post("/auth/login")
async def login(login_input: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_input.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(login_input.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    access_token = create_access_token(data={"sub": user['id']})
    
    return {
        "token": access_token,
        "user": UserResponse(
            id=user['id'],
            name=user['name'],
            email=user['email'],
            role=user['role'],
            totalScore=user['totalScore'],
            badges=user['badges'],
            completedArticles=user['completedArticles']
        )
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# ========== Article Routes ==========

@api_router.get("/articles")
async def get_articles(
    institution: Optional[str] = None,
    language: Optional[str] = None,
    difficulty: Optional[str] = None
):
    query = {}
    if institution:
        query["institution"] = institution
    if language:
        query["language"] = language
    if difficulty:
        query["difficulty"] = difficulty
    
    articles = await db.articles.find(query, {"_id": 0}).to_list(1000)
    return articles

@api_router.get("/articles/{article_id}")
async def get_article(article_id: str):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.post("/articles/simplify")
async def simplify_article(request: SimplifyRequest):
    try:
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=str(uuid.uuid4()),
            system_message="You are an expert at simplifying legal and constitutional text for students and general citizens. Provide clear, simple explanations."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        language = "Hindi" if request.language == "hi" else "English"
        
        # Create user message
        user_message = UserMessage(
            text=f"Simplify the following constitutional article in {language} for easy understanding by students. Keep it concise and clear:\n\n{request.text}"
        )
        
        # Send message and get response
        response = await chat.send_message(user_message)
        
        return {"simplifiedText": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simplification failed: {str(e)}")

# ========== Admin Routes ==========

@api_router.post("/admin/articles")
async def create_article(article_input: ArticleCreate, admin: dict = Depends(get_admin_user)):
    article_dict = article_input.model_dump()
    article_obj = Article(**article_dict)
    
    doc = article_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await db.articles.insert_one(doc)
    
    return ArticleResponse(**article_obj.model_dump())

@api_router.put("/admin/articles/{article_id}")
async def update_article(article_id: str, article_input: ArticleCreate, admin: dict = Depends(get_admin_user)):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_dict = article_input.model_dump()
    await db.articles.update_one({"id": article_id}, {"$set": update_dict})
    
    updated_article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return updated_article

@api_router.delete("/admin/articles/{article_id}")
async def delete_article(article_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted successfully"}

# ========== Game Routes ==========

@api_router.post("/games/attempt")
async def create_game_attempt(attempt_input: GameAttemptCreate, current_user: dict = Depends(get_current_user)):
    # Create game attempt
    attempt_dict = attempt_input.model_dump()
    attempt_obj = GameAttempt(**attempt_dict, userId=current_user['id'])
    
    doc = attempt_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.game_attempts.insert_one(doc)
    
    # Update user score and completed articles
    new_score = current_user['totalScore'] + attempt_obj.score
    completed_articles = current_user.get('completedArticles', [])
    
    if attempt_obj.articleId not in completed_articles and attempt_obj.isCorrect:
        completed_articles.append(attempt_obj.articleId)
    
    # Award badges
    badges = current_user.get('badges', [])
    if new_score >= 100 and "Bronze Scholar" not in badges:
        badges.append("Bronze Scholar")
    if new_score >= 500 and "Silver Scholar" not in badges:
        badges.append("Silver Scholar")
    if new_score >= 1000 and "Gold Scholar" not in badges:
        badges.append("Gold Scholar")
    if len(completed_articles) >= 10 and "Article Master" not in badges:
        badges.append("Article Master")
    
    await db.users.update_one(
        {"id": current_user['id']},
        {"$set": {"totalScore": new_score, "completedArticles": completed_articles, "badges": badges}}
    )
    
    return GameAttemptResponse(**attempt_obj.model_dump())

@api_router.get("/games/leaderboard")
async def get_leaderboard(limit: int = 10):
    users = await db.users.find({}, {"_id": 0, "password": 0}).sort("totalScore", -1).to_list(limit)
    return users

# ========== Analytics Routes ==========

@api_router.get("/analytics/user", response_model=AnalyticsResponse)
async def get_user_analytics(current_user: dict = Depends(get_current_user)):
    # Get all attempts
    attempts = await db.game_attempts.find({"userId": current_user['id']}, {"_id": 0}).to_list(1000)
    
    total_attempts = len(attempts)
    correct_attempts = sum(1 for a in attempts if a.get('isCorrect', False))
    accuracy = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    # Get institution-wise strength
    institution_strength = {"Legislature": 0, "Executive": 0, "Judiciary": 0}
    for attempt in attempts:
        article = await db.articles.find_one({"id": attempt['articleId']}, {"_id": 0})
        if article and attempt.get('isCorrect', False):
            institution_strength[article['institution']] += 1
    
    # Get recent attempts with article details
    recent_attempts = []
    for attempt in sorted(attempts, key=lambda x: x.get('timestamp', ''), reverse=True)[:5]:
        article = await db.articles.find_one({"id": attempt['articleId']}, {"_id": 0})
        recent_attempts.append({
            "gameType": attempt['gameType'],
            "score": attempt['score'],
            "isCorrect": attempt['isCorrect'],
            "articleNumber": article['articleNumber'] if article else None,
            "timestamp": attempt.get('timestamp', '')
        })
    
    total_articles = await db.articles.count_documents({})
    
    return AnalyticsResponse(
        totalArticles=total_articles,
        completedArticles=len(current_user.get('completedArticles', [])),
        totalScore=current_user['totalScore'],
        accuracy=round(accuracy, 2),
        badges=current_user.get('badges', []),
        institutionWiseStrength=institution_strength,
        recentAttempts=recent_attempts
    )

@api_router.get("/analytics/admin")
async def get_admin_analytics(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_articles = await db.articles.count_documents({})
    total_attempts = await db.game_attempts.count_documents({})
    
    # Most difficult articles
    all_attempts = await db.game_attempts.find({}, {"_id": 0}).to_list(10000)
    article_stats = {}
    
    for attempt in all_attempts:
        article_id = attempt['articleId']
        if article_id not in article_stats:
            article_stats[article_id] = {"total": 0, "correct": 0}
        article_stats[article_id]["total"] += 1
        if attempt.get('isCorrect', False):
            article_stats[article_id]["correct"] += 1
    
    difficult_articles = []
    for article_id, stats in article_stats.items():
        if stats["total"] > 0:
            accuracy = (stats["correct"] / stats["total"]) * 100
            article = await db.articles.find_one({"id": article_id}, {"_id": 0})
            if article:
                difficult_articles.append({
                    "articleNumber": article['articleNumber'],
                    "institution": article['institution'],
                    "accuracy": round(accuracy, 2),
                    "totalAttempts": stats["total"]
                })
    
    difficult_articles.sort(key=lambda x: x["accuracy"])
    
    return {
        "totalUsers": total_users,
        "totalArticles": total_articles,
        "totalAttempts": total_attempts,
        "mostDifficultArticles": difficult_articles[:10]
    }

# ========== Seed Data Route ==========

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing_articles = await db.articles.count_documents({})
    if existing_articles > 0:
        return {"message": "Database already seeded"}
    
    # Seed admin user
    admin_exists = await db.users.find_one({"email": "admin@constitution.in"}, {"_id": 0})
    if not admin_exists:
        admin_user = User(
            name="Admin",
            email="admin@constitution.in",
            password=hash_password("Admin@123"),
            role="admin"
        )
        admin_doc = admin_user.model_dump()
        admin_doc['createdAt'] = admin_doc['createdAt'].isoformat()
        await db.users.insert_one(admin_doc)
    
    # Sample articles
    sample_articles = [
        {"articleNumber": 1, "institution": "Legislature", "originalText": "India, that is Bharat, shall be a Union of States.", "simplifiedText": "India (also called Bharat) is a union of different states working together.", "example": "Like how different states in India work together under one government.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 14, "institution": "Judiciary", "originalText": "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.", "simplifiedText": "Everyone in India is equal before the law. No one can be treated unfairly by the government.", "example": "Rich or poor, everyone has the same rights in court.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 19, "institution": "Judiciary", "originalText": "All citizens shall have the right to freedom of speech and expression.", "simplifiedText": "Every citizen has the right to speak freely and express their opinions.", "example": "You can share your views, write articles, or peacefully protest.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 21, "institution": "Judiciary", "originalText": "No person shall be deprived of his life or personal liberty except according to procedure established by law.", "simplifiedText": "Everyone has the right to life and freedom. These can only be taken away through proper legal process.", "example": "You cannot be arrested or jailed without following proper legal procedures.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 32, "institution": "Judiciary", "originalText": "The right to move the Supreme Court for the enforcement of fundamental rights.", "simplifiedText": "If your fundamental rights are violated, you can directly approach the Supreme Court.", "example": "If someone stops you from practicing your religion, you can file a case in Supreme Court.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 44, "institution": "Legislature", "originalText": "The State shall endeavour to secure for the citizens a uniform civil code throughout the territory of India.", "simplifiedText": "The government should try to create the same set of civil laws for all citizens.", "example": "Same laws for marriage, divorce, and inheritance for everyone.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 51, "institution": "Executive", "originalText": "It shall be the duty of every citizen to abide by the Constitution and respect its ideals.", "simplifiedText": "Every citizen must follow the Constitution and respect what it stands for.", "example": "Respect the national flag, anthem, and follow laws.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 52, "institution": "Executive", "originalText": "There shall be a President of India.", "simplifiedText": "India will have a President as the head of state.", "example": "The President is the first citizen and represents the nation.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 53, "institution": "Executive", "originalText": "The executive power of the Union shall be vested in the President.", "simplifiedText": "The President holds the executive power of the country.", "example": "The President can make important decisions for the nation.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 74, "institution": "Executive", "originalText": "There shall be a Council of Ministers with the Prime Minister at the head to aid and advise the President.", "simplifiedText": "The Prime Minister and Council of Ministers help and advise the President.", "example": "The PM and ministers run the government and advise the President.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 76, "institution": "Judiciary", "originalText": "The President shall appoint a person who is qualified to be appointed a Judge of the Supreme Court to be Attorney-General for India.", "simplifiedText": "The President appoints the Attorney-General who must be qualified to be a Supreme Court judge.", "example": "The Attorney-General is the government's chief legal advisor.", "difficulty": "Hard", "language": "en"},
        {"articleNumber": 79, "institution": "Legislature", "originalText": "There shall be a Parliament for the Union which shall consist of the President and two Houses known as the Council of States and the House of the People.", "simplifiedText": "India's Parliament has three parts: the President, Rajya Sabha (Council of States), and Lok Sabha (House of the People).", "example": "Laws are made when both houses and the President agree.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 80, "institution": "Legislature", "originalText": "The Council of States shall consist of not more than 250 members.", "simplifiedText": "The Rajya Sabha can have up to 250 members.", "example": "Currently, Rajya Sabha has 245 members representing states.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 81, "institution": "Legislature", "originalText": "The House of the People shall consist of not more than 550 members chosen by direct election.", "simplifiedText": "The Lok Sabha can have up to 550 members elected directly by people.", "example": "Citizens vote in elections to choose their Lok Sabha representatives.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 123, "institution": "Executive", "originalText": "If the President is satisfied that circumstances exist which render it necessary for him to take immediate action, he may promulgate such Ordinances.", "simplifiedText": "When Parliament is not in session, the President can issue emergency orders called Ordinances.", "example": "During emergencies, the President can make temporary laws.", "difficulty": "Hard", "language": "en"},
        {"articleNumber": 124, "institution": "Judiciary", "originalText": "There shall be a Supreme Court of India.", "simplifiedText": "India will have a Supreme Court as the highest court.", "example": "The Supreme Court is the final authority on legal matters.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 226, "institution": "Judiciary", "originalText": "Every High Court shall have power to issue writs for the enforcement of any fundamental rights.", "simplifiedText": "High Courts can issue special orders to protect your fundamental rights.", "example": "If your rights are violated, you can approach the High Court.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 262, "institution": "Legislature", "originalText": "Parliament may by law provide for the adjudication of any dispute with respect to the use of waters of any inter-State river.", "simplifiedText": "Parliament can make laws to resolve water sharing disputes between states.", "example": "Disputes like Cauvery water sharing are resolved through Parliament's laws.", "difficulty": "Medium", "language": "en"},
        {"articleNumber": 324, "institution": "Executive", "originalText": "The superintendence, direction and control of elections shall be vested in the Election Commission.", "simplifiedText": "The Election Commission manages and controls all elections in India.", "example": "The Election Commission ensures free and fair elections.", "difficulty": "Easy", "language": "en"},
        {"articleNumber": 356, "institution": "Executive", "originalText": "If the President is satisfied that the government of the State cannot be carried on in accordance with the provisions of this Constitution, the President may assume to himself all or any of the functions of the Government of the State.", "simplifiedText": "If a state government fails, the President can take over and impose President's Rule.", "example": "When law and order fails in a state, central government takes control.", "difficulty": "Hard", "language": "en"}
    ]
    
    for article_data in sample_articles:
        article_obj = Article(**article_data)
        doc = article_obj.model_dump()
        doc['createdAt'] = doc['createdAt'].isoformat()
        await db.articles.insert_one(doc)
    
    return {"message": f"Database seeded successfully with {len(sample_articles)} articles and admin user"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
