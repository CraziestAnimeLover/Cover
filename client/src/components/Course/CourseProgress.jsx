import { FiCheckCircle, FiCircle } from 'react-icons/fi';

const CourseProgress = ({ progress, totalLectures, completedLectures }) => {
  const percentage = Math.round((completedLectures / totalLectures) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Course Progress</span>
        <span className="font-semibold text-primary">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary rounded-full h-2 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{completedLectures} / {totalLectures} lectures completed</span>
        {percentage === 100 && (
          <span className="text-green-500 flex items-center">
            <FiCheckCircle className="mr-1" /> Completed
          </span>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;