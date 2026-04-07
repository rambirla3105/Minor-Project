#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ConstitutionAPITester:
    def __init__(self, base_url="https://dharma-learn-5.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            return success, response.json() if success and response.text else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test data seeding"""
        print("\n🌱 Testing Data Seeding...")
        success, response = self.run_test(
            "Seed Database",
            "POST",
            "seed",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        print("\n🔐 Testing Admin Authentication...")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@constitution.in", "password": "Admin@123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            return True
        return False

    def test_user_registration_login(self):
        """Test user registration and login"""
        print("\n👤 Testing User Authentication...")
        
        # Register test user
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"name": "Test User", "email": test_email, "password": "Test@123"}
        )
        
        if success and 'token' in response:
            self.user_token = response['token']
            
            # Test login with same credentials
            success, response = self.run_test(
                "User Login",
                "POST",
                "auth/login",
                200,
                data={"email": test_email, "password": "Test@123"}
            )
            return success
        return False

    def test_articles_api(self):
        """Test articles endpoints"""
        print("\n📚 Testing Articles API...")
        
        # Get all articles
        success, articles = self.run_test(
            "Get All Articles",
            "GET",
            "articles",
            200
        )
        
        if success and articles:
            article_id = articles[0]['id']
            
            # Get specific article
            self.run_test(
                "Get Article by ID",
                "GET",
                f"articles/{article_id}",
                200
            )
            
            # Test filters
            self.run_test(
                "Filter by Institution",
                "GET",
                "articles?institution=Legislature",
                200
            )
            
            self.run_test(
                "Filter by Difficulty",
                "GET",
                "articles?difficulty=Easy",
                200
            )
            
            self.run_test(
                "Filter by Language",
                "GET",
                "articles?language=en",
                200
            )
            
            return True
        return False

    def test_ai_simplification(self):
        """Test AI simplification feature"""
        print("\n🤖 Testing AI Simplification...")
        
        if not self.user_token:
            self.log_test("AI Simplification", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success, response = self.run_test(
            "AI Simplify Article",
            "POST",
            "articles/simplify",
            200,
            data={"text": "The State shall not deny to any person equality before the law.", "language": "en"},
            headers=headers
        )
        return success

    def test_admin_crud(self):
        """Test admin CRUD operations"""
        print("\n⚙️ Testing Admin CRUD Operations...")
        
        if not self.admin_token:
            self.log_test("Admin CRUD", False, "No admin token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Create article
        article_data = {
            "articleNumber": 999,
            "institution": "Legislature",
            "originalText": "Test article original text",
            "simplifiedText": "Test article simplified text",
            "example": "Test example",
            "difficulty": "Easy",
            "language": "en"
        }
        
        success, response = self.run_test(
            "Create Article",
            "POST",
            "admin/articles",
            200,
            data=article_data,
            headers=headers
        )
        
        if success and 'id' in response:
            article_id = response['id']
            
            # Update article
            updated_data = article_data.copy()
            updated_data['simplifiedText'] = "Updated simplified text"
            
            self.run_test(
                "Update Article",
                "PUT",
                f"admin/articles/{article_id}",
                200,
                data=updated_data,
                headers=headers
            )
            
            # Delete article
            self.run_test(
                "Delete Article",
                "DELETE",
                f"admin/articles/{article_id}",
                200,
                headers=headers
            )
            
            return True
        return False

    def test_games_api(self):
        """Test games functionality"""
        print("\n🎮 Testing Games API...")
        
        if not self.user_token:
            self.log_test("Games API", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # Get articles first to get an article ID
        success, articles = self.run_test(
            "Get Articles for Game",
            "GET",
            "articles",
            200
        )
        
        if success and articles:
            article_id = articles[0]['id']
            
            # Create game attempt
            attempt_data = {
                "articleId": article_id,
                "gameType": "spin-wheel",
                "score": 50,
                "isCorrect": True,
                "timeTaken": 15
            }
            
            success = self.run_test(
                "Create Game Attempt",
                "POST",
                "games/attempt",
                200,
                data=attempt_data,
                headers=headers
            )[0]
            
            # Get leaderboard
            self.run_test(
                "Get Leaderboard",
                "GET",
                "games/leaderboard",
                200
            )
            
            return success
        return False

    def test_analytics_api(self):
        """Test analytics endpoints"""
        print("\n📊 Testing Analytics API...")
        
        if not self.user_token:
            self.log_test("Analytics API", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        
        # User analytics
        success = self.run_test(
            "Get User Analytics",
            "GET",
            "analytics/user",
            200,
            headers=headers
        )[0]
        
        # Admin analytics (if admin token available)
        if self.admin_token:
            admin_headers = {'Authorization': f'Bearer {self.admin_token}'}
            self.run_test(
                "Get Admin Analytics",
                "GET",
                "analytics/admin",
                200,
                headers=admin_headers
            )
        
        return success

    def test_auth_me(self):
        """Test auth/me endpoint"""
        print("\n🔍 Testing Auth Me Endpoint...")
        
        if not self.user_token:
            self.log_test("Auth Me", False, "No user token available")
            return False
            
        headers = {'Authorization': f'Bearer {self.user_token}'}
        success = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            headers=headers
        )[0]
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Constitutional Learning Platform API Tests")
        print(f"🎯 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        self.test_seed_data()
        
        if self.test_admin_login():
            if self.test_user_registration_login():
                self.test_articles_api()
                self.test_ai_simplification()
                self.test_admin_crud()
                self.test_games_api()
                self.test_analytics_api()
                self.test_auth_me()
            else:
                print("❌ User authentication failed, skipping dependent tests")
        else:
            print("❌ Admin authentication failed, skipping dependent tests")
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = ConstitutionAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())