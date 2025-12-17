import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: null,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, companyName: user.companyName || '' }));
    }
  }, [user]);

  const onChange = (e) => {
    if (e.target.name === 'companyLogo') {
      setFormData((prev) => ({ ...prev, companyLogo: e.target.files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const profileData = new FormData();
    profileData.append('companyName', formData.companyName);
    if (formData.companyLogo) {
      profileData.append('companyLogo', formData.companyLogo);
    }
    dispatch(updateUserProfile(profileData));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" value={formData.companyName} onChange={onChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Company Logo</Label>
              <Input id="companyLogo" name="companyLogo" type="file" onChange={onChange} />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;
