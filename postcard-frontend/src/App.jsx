import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Button } from "./components/ui/button";
import { TextInputArea } from "./components/TextInputArea";
import { EntryList } from "./components/EntryList";
import { SearchArea } from "./components/SearchArea";
import { ModeToggle } from "./components/ModeToggle";

function App() {
  const { session, user, signOut } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center">
            <a className="flex items-center space-x-2" href="/">
              <span className="font-bold text-xl">Postcard</span>
            </a>
          </div>
          
          <nav className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">{user?.email}</span>
            <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
            <ModeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
          <div className="grid gap-8">
            <SearchArea />
            <TextInputArea />
            <EntryList />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-6">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center md:flex-row md:justify-between">
          <p className="text-center text-sm text-muted-foreground">
            Built with ❤️
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2 md:mt-0">
            © {new Date().getFullYear()} Postcard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
