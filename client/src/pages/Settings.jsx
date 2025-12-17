import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const sections = useMemo(
    () => [
      { key: 'business', label: 'Business Profile' },
      { key: 'invoice', label: 'Invoice Defaults' },
      { key: 'tax', label: 'Tax & Compliance' },
      { key: 'account', label: 'Account' },
    ],
    [],
  );

  const [activeSection, setActiveSection] = useState('business');

  const [businessProfile, setBusinessProfile] = useState({
    companyName: user?.companyName || '',
    companyEmail: user?.companyEmail || '',
    companyPhone: user?.companyPhone || '',
    companyAddress: user?.companyAddress || '',
    companyLogo: null,
  });

  const [invoiceDefaults, setInvoiceDefaults] = useState({
    currency: user?.defaultCurrency || 'USD',
    paymentTerms: user?.defaultPaymentTerms || 'Net 15',
    invoicePrefix: user?.invoicePrefix || 'INV',
  });

  const [taxCompliance, setTaxCompliance] = useState({
    taxLabel: user?.taxLabel || 'Tax',
    defaultTaxRate: Number(user?.defaultTaxRate || 0),
  });

  const [account, setAccount] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [dirty, setDirty] = useState({
    business: false,
    invoice: false,
    tax: false,
    account: false,
  });

  const hasUnsavedChanges = dirty[activeSection];

  const switchSection = (key) => {
    if (key === activeSection) return;

    if (hasUnsavedChanges) {
      const ok = window.confirm('Discard unsaved changes?');
      if (!ok) return;
      setDirty((prev) => ({ ...prev, [activeSection]: false }));
    }

    setActiveSection(key);
  };

  const onSave = (e) => {
    e.preventDefault();

    if (activeSection === 'business') {
      const profileData = new FormData();
      profileData.append('companyName', businessProfile.companyName);
      profileData.append('companyEmail', businessProfile.companyEmail);
      profileData.append('companyPhone', businessProfile.companyPhone);
      profileData.append('companyAddress', businessProfile.companyAddress);
      if (businessProfile.companyLogo) {
        profileData.append('companyLogo', businessProfile.companyLogo);
      }

      // TODO (backend): persist business profile fields and logo.
      dispatch(updateUserProfile(profileData));
      setDirty((prev) => ({ ...prev, business: false }));
      return;
    }

    if (activeSection === 'invoice') {
      // TODO (backend): persist invoice defaults (currency, payment terms, invoice prefix).
      setDirty((prev) => ({ ...prev, invoice: false }));
      return;
    }

    if (activeSection === 'tax') {
      // TODO (backend): persist tax defaults (label and default rate). Applies to future invoices only.
      setDirty((prev) => ({ ...prev, tax: false }));
      return;
    }

    if (activeSection === 'account') {
      // TODO (backend): persist account profile fields and password change (if supported).
      setDirty((prev) => ({ ...prev, account: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your business details and invoice defaults.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="p-2">
          <nav className="flex flex-col">
            {sections.map((section) => {
              const isActive = section.key === activeSection;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => switchSection(section.key)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  {section.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <form onSubmit={onSave} className="space-y-4">
          {activeSection === 'business' ? (
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">Applies to future invoices only.</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Business name</Label>
                    <Input
                      id="companyName"
                      value={businessProfile.companyName}
                      onChange={(e) => {
                        setBusinessProfile((p) => ({ ...p, companyName: e.target.value }));
                        setDirty((d) => ({ ...d, business: true }));
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Business email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={businessProfile.companyEmail}
                      onChange={(e) => {
                        setBusinessProfile((p) => ({ ...p, companyEmail: e.target.value }));
                        setDirty((d) => ({ ...d, business: true }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Phone</Label>
                    <Input
                      id="companyPhone"
                      value={businessProfile.companyPhone}
                      onChange={(e) => {
                        setBusinessProfile((p) => ({ ...p, companyPhone: e.target.value }));
                        setDirty((d) => ({ ...d, business: true }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyLogo">Logo</Label>
                    <Input
                      id="companyLogo"
                      type="file"
                      onChange={(e) => {
                        setBusinessProfile((p) => ({ ...p, companyLogo: e.target.files?.[0] || null }));
                        setDirty((d) => ({ ...d, business: true }));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Business address</Label>
                  <Input
                    id="companyAddress"
                    value={businessProfile.companyAddress}
                    onChange={(e) => {
                      setBusinessProfile((p) => ({ ...p, companyAddress: e.target.value }));
                      setDirty((d) => ({ ...d, business: true }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeSection === 'invoice' ? (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Defaults</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">Applies to future invoices only.</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default currency</Label>
                    <Select
                      value={invoiceDefaults.currency}
                      onValueChange={(value) => {
                        setInvoiceDefaults((p) => ({ ...p, currency: value }));
                        setDirty((d) => ({ ...d, invoice: true }));
                      }}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Default payment terms</Label>
                    <Input
                      id="paymentTerms"
                      value={invoiceDefaults.paymentTerms}
                      onChange={(e) => {
                        setInvoiceDefaults((p) => ({ ...p, paymentTerms: e.target.value }));
                        setDirty((d) => ({ ...d, invoice: true }));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice number prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={invoiceDefaults.invoicePrefix}
                    onChange={(e) => {
                      setInvoiceDefaults((p) => ({ ...p, invoicePrefix: e.target.value }));
                      setDirty((d) => ({ ...d, invoice: true }));
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeSection === 'tax' ? (
            <Card>
              <CardHeader>
                <CardTitle>Tax & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">Applies to future invoices only.</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taxLabel">Tax label</Label>
                    <Input
                      id="taxLabel"
                      value={taxCompliance.taxLabel}
                      onChange={(e) => {
                        setTaxCompliance((p) => ({ ...p, taxLabel: e.target.value }));
                        setDirty((d) => ({ ...d, tax: true }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Default tax rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      min={0}
                      max={100}
                      value={taxCompliance.defaultTaxRate}
                      onChange={(e) => {
                        setTaxCompliance((p) => ({ ...p, defaultTaxRate: Number(e.target.value) }));
                        setDirty((d) => ({ ...d, tax: true }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeSection === 'account' ? (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Name</Label>
                    <Input
                      id="accountName"
                      value={account.name}
                      onChange={(e) => {
                        setAccount((p) => ({ ...p, name: e.target.value }));
                        setDirty((d) => ({ ...d, account: true }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountEmail">Email</Label>
                    <Input
                      id="accountEmail"
                      type="email"
                      value={account.email}
                      onChange={(e) => {
                        setAccount((p) => ({ ...p, email: e.target.value }));
                        setDirty((d) => ({ ...d, account: true }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {hasUnsavedChanges ? (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  // Guardrail: explicit discard.
                  const ok = window.confirm('Discard changes?');
                  if (!ok) return;
                  setDirty((prev) => ({ ...prev, [activeSection]: false }));
                }}
              >
                Discard
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

export default Settings;
