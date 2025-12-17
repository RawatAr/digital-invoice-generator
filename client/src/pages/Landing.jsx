import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Zap, Shield } from 'lucide-react';

function Landing() {
  return (
    <div className="relative flex flex-col items-center text-center space-y-12 py-20 md:py-24 bg-gradient-to-b from-background via-background to-muted/40">
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_60%_at_50%_0%,black,transparent)] bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Effortless Invoicing for Modern Businesses
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          Create, send, and manage professional invoices in minutes. Streamline your billing process and get paid faster.
        </p>
      </div>
      <div className="space-x-4">
        <Button asChild size="lg">
          <Link to="/register">Get Started for Free</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-12">
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-2">
          <FileText className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-xl font-semibold">Professional Templates</h3>
          <p className="text-muted-foreground">
            Choose from a variety of modern templates to create beautiful, professional invoices.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-2">
          <Zap className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-xl font-semibold">Fast and Easy</h3>
          <p className="text-muted-foreground">
            Our intuitive interface makes creating and sending invoices a breeze. Save time and focus on your business.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-2">
          <Shield className="h-12 w-12 mb-4 text-primary" />
          <h3 className="text-xl font-semibold">Secure and Reliable</h3>
          <p className="text-muted-foreground">
            Your data is safe with us. We use industry-standard security to protect your information.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
