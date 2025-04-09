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
        <div className="container flex h-16 items-center max-w-6xl mx-auto px-4">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              {/* Placeholder for logo/icon */}
              <span className="font-bold text-lg">Postcard</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{user?.email}</span>
                <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
                <ModeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 max-w-3xl">
        <div className="space-y-8">
          <SearchArea />
          <TextInputArea />
          <EntryList />
        </div>
      </main>

      {/* Footer (Optional) */}
      <footer className="py-6 border-t">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
