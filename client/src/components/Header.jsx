import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../store/authSlice';
import { LogIn, LogOut, UserPlus, LayoutDashboard, Users, Package, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ModeToggle } from './ModeToggle';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <header className='sticky top-0 z-50 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className="container flex h-16 items-center justify-between">
        <Link to='/' className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>InvoiceGen</Link>
        <nav className="hidden md:flex items-center space-x-2">
          <Button asChild variant='ghost'>
            <Link to='/about'>About</Link>
          </Button>
          <Button asChild variant='ghost'>
            <Link to='/contact'>Contact</Link>
          </Button>
        </nav>
      </div>
      <nav className="container flex items-center justify-end gap-2 pb-4 md:pb-0">
        <ModeToggle />
        {user ? (
          <>
            <Button asChild variant='ghost'>
              <Link to='/dashboard'><LayoutDashboard className='mr-2 h-4 w-4' />Dashboard</Link>
            </Button>
            <Button asChild variant='ghost'>
              <Link to='/clients'><Users className='mr-2 h-4 w-4' />Clients</Link>
            </Button>
            <Button asChild variant='ghost'>
              <Link to='/items'><Package className='mr-2 h-4 w-4' />Items</Link>
            </Button>
            <Button asChild variant='ghost'>
              <Link to='/settings'><Settings className='mr-2 h-4 w-4' />Settings</Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button onClick={onLogout}>
              <LogOut className='mr-2 h-4 w-4' /> Logout
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant='ghost'>
              <Link to='/login'>
                <LogIn className='mr-2 h-4 w-4' /> Login
              </Link>
            </Button>
            <Button asChild>
              <Link to='/register'>
                <UserPlus className='mr-2 h-4 w-4' /> Register
              </Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
