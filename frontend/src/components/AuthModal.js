import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeSlash, CheckCircle, XCircle, User, Envelope, Lock } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
    { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
    { label: 'One number', test: (pwd) => /[0-9]/.test(pwd) },
    { label: 'One special character (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const getPasswordStrength = (password) => {
    const passed = passwordRequirements.filter(req => req.test(password)).length;
    if (passed <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (passed <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      const failedReqs = passwordRequirements.filter(req => !req.test(formData.password));
      if (failedReqs.length > 0) {
        toast.error('Password does not meet all requirements');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(formData.name, formData.email, formData.password);
      }
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  const strength = !isLogin && formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1A1A1B] border-4 border-[#1A237E] dark:border-[#FFD54F] shadow-[12px_12px_0px_#1A237E] dark:shadow-[12px_12px_0px_#FFD54F] rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/10 to-[#FFD54F]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#00E676]/10 to-[#29B6F6]/10 rounded-full blur-3xl -z-10" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-[#F0EFEA] dark:hover:bg-[#0A0A0B] rounded-lg transition-all"
              data-testid="auth-close-btn"
            >
              <X size={24} weight="bold" className="text-[#1A237E] dark:text-[#FDFBF7]" />
            </button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="text-3xl sm:text-4xl font-black text-[#1A237E] dark:text-[#FDFBF7] mb-2 font-heading">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-base text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
                {isLogin ? 'Login to continue your learning journey' : 'Join us to master the Constitution'}
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-bold uppercase tracking-wider text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A237E]/40 dark:text-[#FDFBF7]/40" />
                    <input
                      data-testid="auth-name-input"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="neo-input has-icon dark:bg-[#0A0A0B] dark:text-[#FDFBF7] dark:border-[#FFD54F] w-full"
                      placeholder="Enter your name"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isLogin ? 0.2 : 0.3 }}
              >
                <label className="block text-sm font-bold uppercase tracking-wider text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Envelope size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A237E]/40 dark:text-[#FDFBF7]/40" />
                  <input
                    data-testid="auth-email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="neo-input has-icon dark:bg-[#0A0A0B] dark:text-[#FDFBF7] dark:border-[#FFD54F] w-full"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: isLogin ? 0.3 : 0.4 }}
              >
                <label className="block text-sm font-bold uppercase tracking-wider text-[#1A237E]/70 dark:text-[#FDFBF7]/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} weight="bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1A237E]/40 dark:text-[#FDFBF7]/40" />
                  <input
                    data-testid="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="neo-input has-icon dark:bg-[#0A0A0B] dark:text-[#FDFBF7] dark:border-[#FFD54F] w-full pr-12"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A237E]/40 dark:text-[#FDFBF7]/40 hover:text-[#FF6B35] transition-colors"
                  >
                    {showPassword ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {!isLogin && formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-[#1A237E]/70 dark:text-[#FDFBF7]/70">Password Strength:</span>
                      <span className={`text-sm font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                    </div>
                    <div className="h-2 bg-[#F0EFEA] dark:bg-[#0A0A0B] rounded-full overflow-hidden border-2 border-[#1A237E] dark:border-[#FFD54F]">
                      <motion.div
                        className={`h-full ${strength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Requirements Checklist */}
                    <div className="mt-3 space-y-1">
                      {passwordRequirements.map((req, index) => {
                        const passed = req.test(formData.password);
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-2 text-sm"
                          >
                            {passed ? (
                              <CheckCircle size={16} weight="fill" className="text-green-500" />
                            ) : (
                              <XCircle size={16} weight="fill" className="text-red-500" />
                            )}
                            <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-[#1A237E]/60 dark:text-[#FDFBF7]/60'}>
                              {req.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                data-testid="auth-submit-btn"
                className="neo-btn-primary w-full text-lg"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : (
                  isLogin ? 'Login' : 'Create Account'
                )}
              </motion.button>
            </form>

            {/* Toggle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center"
            >
              <p className="text-[#1A237E]/70 dark:text-[#FDFBF7]/70">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                data-testid="auth-toggle-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: '', email: '', password: '' });
                }}
                className="text-[#FF6B35] font-bold hover:underline mt-1 text-lg"
              >
                {isLogin ? 'Create Account' : 'Login'}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
