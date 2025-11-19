import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
  bgColor: string;
  suggestions: string[];
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (pwd: string): StrengthResult => {
    if (!pwd) {
      return {
        score: 0,
        label: '',
        color: '',
        bgColor: '',
        suggestions: [],
      };
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (pwd.length >= 8) score++;
    else suggestions.push('Use at least 8 characters');

    if (pwd.length >= 12) score++;

    // Has lowercase
    if (/[a-z]/.test(pwd)) score++;
    else suggestions.push('Include lowercase letters');

    // Has uppercase
    if (/[A-Z]/.test(pwd)) score++;
    else suggestions.push('Include uppercase letters');

    // Has numbers
    if (/\d/.test(pwd)) score++;
    else suggestions.push('Include numbers');

    // Has special characters
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    else suggestions.push('Include special characters (!@#$%^&*)');

    // Calculate final score (0-4)
    const finalScore = Math.min(Math.floor(score / 1.5), 4);

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600'];
    const bgColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

    return {
      score: finalScore,
      label: labels[finalScore],
      color: colors[finalScore],
      bgColor: bgColors[finalScore],
      suggestions: finalScore < 3 ? suggestions.slice(0, 2) : [],
    };
  };

  const strength = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Strength Bar */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength.score ? strength.bgColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      {strength.label && (
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${strength.color}`}>
            Password strength: {strength.label}
          </span>
        </div>
      )}

      {/* Suggestions */}
      {strength.suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {strength.suggestions.map((suggestion, index) => (
            <p key={index} className="text-xs text-gray-600 flex items-center">
              <span className="text-gray-400 mr-1">•</span>
              {suggestion}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
