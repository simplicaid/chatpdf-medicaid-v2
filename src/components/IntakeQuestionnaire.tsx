"use client";
import React, { useState } from 'react';

type Question = {
  text: string;
  options: string[];
};

type IntakeQuestionnaireProps = {
    onComplete: () => void;
  };  

const initialQuestions: Question[] = [
    { text: "Are you a US citizen? (If not, you must be a resident to proceed.)", options: ["Yes", "No"] },
    { text: "How many members in your family are living with you?", options: ["0", "1", "2", "3", "4"] },
    { text: "Are you currently being compensated a wage or salary?", options: ["Yes", "No"] },
    { text: "Do you have any other forms of income (i.e. self-employment, unemployment benefits)?", options: ["Yes", "No"] },
    { text: "Are you required to pay court order support?", options: ["Yes", "No"] },
    { text: "Are you on health insurance or Medicare?", options: ["Yes", "No"] },
    { text: "Do you have medical bills in the last 3 months?", options: ["Yes", "No"] },
    { text: "Are you age 65 or older, certified blind or disabled, with no children under the age of 21 living with you?", options: ["Yes", "No"] },
    { text: "Are you currently a college student?", options: ["Yes", "No"] },
  ];  

const IntakeQuestionnaire: React.FC<IntakeQuestionnaireProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<string[]>(new Array(initialQuestions.length).fill(''));

  const handleOptionChange = (value: string, index: number) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    const allAnswered = answers.every(answer => answer !== '');
    if(allAnswered) {
      console.log('All answers submitted:', answers);
      onComplete();
    } else {
      console.warn('Please answer all questions before submitting.');
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold pt-4 mb-4">Questions</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {initialQuestions.map((question, index) => (
          <div key={index} className="mb-6">
            <p className="mb-2">{question.text}</p>
            <div>
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="inline-flex items-center mr-6">
                  <input
                    type="radio"
                    name={`question_${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => handleOptionChange(option, index)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded shadow">
          Submit
        </button>
      </form>
    </div>
  );
};

export default IntakeQuestionnaire;