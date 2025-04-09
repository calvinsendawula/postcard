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
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center max-w-4xl mx-auto">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              {/* Placeholder for logo/icon */}
              <span className="hidden font-bold sm:inline-block">Postcard</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Maybe integrate search into header later? */}
            </div>
            <nav className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:inline-block">{user?.email}</span>
                <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
                <ModeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 max-w-2xl space-y-8">
          <SearchArea />
          <TextInputArea />
          <EntryList />
      </main>

      {/* Footer (Optional) */}
      {/* <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default App;
