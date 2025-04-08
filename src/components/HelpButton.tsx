import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, Send, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { addSupportMessage } from '../services/firebase';

export const HelpButton: React.FC = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(0);
      setFormData({ description: '' });
      setError(null);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!formData.description || !user) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addSupportMessage({
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        description: formData.description
      });
      setStep(1); // Show success message
    } catch (error) {
      console.error('Failed to submit:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full
          bg-gray-800/90 hover:bg-gray-700/90
          border border-gray-600/50 hover:border-[#00ff9d]/30
          shadow-lg hover:shadow-xl transition-all duration-300
          hover:shadow-[#00ff9d]/10 z-50"
      >
        <HelpCircle className="w-6 h-6 text-[#00ff9d]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
          animate-[fadeIn_0.2s_ease-out]"
        >
          <div
            ref={modalRef}
            className="section-container fixed bottom-[100px] right-6 
              w-full max-w-md animate-[slideUp_0.3s_ease-out] mx-4"
          >
            <div className="bg-gray-800/95 backdrop-blur-md rounded-xl p-6
              border border-gray-700/50 shadow-xl mx-4"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 
                  hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {step === 0 ? (
                  <>
                    <h3 className="text-xl font-semibold text-white">
                      How can we help?
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Describe your issue and we'll get back to you shortly.
                    </p>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ description: e.target.value })}
                      placeholder="Type your message here..."
                      className="w-full h-32 bg-gray-700/50 border border-gray-600/50
                        rounded-lg p-3 text-white placeholder-gray-400 resize-none
                        focus:outline-none focus:border-blue-500/50 focus:ring-1 
                        focus:ring-blue-500/50 transition-all neon-input"
                    />
                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !formData.description}
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 
                        disabled:bg-gray-600 disabled:cursor-not-allowed
                        rounded-lg text-white font-medium transition-colors
                        flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 
                          border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 
                      text-green-400 flex items-center justify-center mx-auto mb-4"
                    >
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      Message Sent!
                    </h3>
                    <p className="text-gray-300 text-sm">
                      We'll get back to you as soon as possible.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
