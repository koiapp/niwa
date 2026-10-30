// Retired lesson item IDs, per lesson (the course's own copy). A retired item keeps its saved answers and completion, but
// is dropped from pattern re-tests and reason records. The course has retired nothing yet; never reuse an ID listed here.
export const retiredLessonItems={};
export const retiredLessonReasons={};
export const isRetiredLessonItem=(lesson,item)=>(retiredLessonItems[lesson]||[]).includes(item);
export const isRetiredLessonReason=(lesson,item)=>(retiredLessonReasons[lesson]||[]).includes(item);
