import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiClock } from 'react-icons/fi';

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course._id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Thumbnail'}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.discountPrice && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition">
            {course.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Instructor */}
          <p className="text-gray-500 text-xs mb-3">
            By {course.instructor?.name || 'Expert Instructor'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <FiStar className="text-yellow-400" />
              <span>{course.rating?.toFixed(1) || 'New'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers />
              <span>{course.totalStudents || 0} students</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock />
              <span>{Math.floor(course.duration / 60)} hours</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {course.discountPrice ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-primary">₹{course.discountPrice}</span>
                  <span className="text-sm text-gray-400 line-through">₹{course.price}</span>
                </div>
              ) : (
                <span className="text-xl font-bold text-primary">₹{course.price}</span>
              )}
            </div>
            <button className="text-primary font-medium text-sm hover:underline">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;