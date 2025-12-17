import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { register, reset } from '../store/authSlice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { UserPlus, Loader2 } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });

  const { name, email, password, password2 } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error('Passwords do not match');
    } else {
      const userData = { name, email, password };
      dispatch(register(userData));
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[calc(100vh-200px)]'>
      <Card className='w-[400px]'>
        <CardHeader className='text-center'>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>Please create an account</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input type='text' id='name' name='name' value={name} placeholder='Enter your name' onChange={onChange} required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input type='email' id='email' name='email' value={email} placeholder='Enter your email' onChange={onChange} required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password'>Password</Label>
              <Input type='password' id='password' name='password' value={password} placeholder='Enter password' onChange={onChange} required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='password2'>Confirm Password</Label>
              <Input type='password' id='password2' name='password2' value={password2} placeholder='Confirm password' onChange={onChange} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className='mr-2 h-4 w-4' />
              )}
              Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Register;
