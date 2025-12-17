function About() {
  return (
    <div className="space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">About InvoiceGen</h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
          InvoiceGen was created to simplify the invoicing process for freelancers and small businesses.
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p className="text-muted-foreground">
          Our mission is to provide a simple, intuitive, and powerful tool that helps you manage your invoices effortlessly. We believe that you should spend less time on paperwork and more time on what you do best: running your business.
        </p>
        <h2 className="text-2xl font-semibold">Our Features</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-2">
          <li>Create and send professional invoices in minutes.</li>
          <li>Manage your clients and items with ease.</li>
          <li>Track the status of your invoices and get paid faster.</li>
          <li>Secure and reliable cloud-based storage.</li>
        </ul>
      </div>
    </div>
  );
}

export default About;
