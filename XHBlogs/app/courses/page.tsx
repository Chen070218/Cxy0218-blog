import './courses.css';
import Navbar from '../../components/Navbar';
import CourseCalendar from './CourseCalendar';
export const metadata = { title: '课程周历' };
export default function CoursesPage() { return <><Navbar/><CourseCalendar/></>; }
