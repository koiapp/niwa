// One deterministic rule for every scored question. Free text is never scored.
export function validQuestion(q){
 return !!q&&typeof q.question==='string'&&q.question.trim().length>0&&
  Array.isArray(q.choices)&&q.choices.length>=2&&q.choices.every(s=>typeof s==='string'&&s.trim())&&
  new Set(q.choices).size===q.choices.length&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.choices.length&&
  Array.isArray(q.feedback)&&q.feedback.length===q.choices.length&&q.feedback.every(s=>typeof s==='string'&&s.trim());
}
export function assessChoice(question,choice){
 if(!validQuestion(question))throw new TypeError('A question needs an answer key and feedback for every choice.');
 if(!Number.isInteger(choice)||choice<0||choice>=question.choices.length)throw new RangeError('Choose one of the listed answers.');
 return {correct:choice===question.correct,feedback:question.feedback[choice]};
}
