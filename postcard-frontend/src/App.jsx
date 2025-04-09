import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Button } from "./components/ui/button";
import { TextInputArea } from "./components/TextInputArea";
import { EntryList } from "./components/EntryList";
import { SearchArea } from "./components/SearchArea";
import { ModeToggle } from "./components/ModeToggle";
import { motion } from "framer-motion";
import { LogOut, ChevronRight } from "lucide-react";

function App() {
  const { session, user, signOut } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="h-full w-full min-h-screen flex flex-col bg-background/95">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <div className="flex items-center">
            <a className="flex items-center space-x-3 group" href="/">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center overflow-hidden shadow-sm transition-all">
                <span className="text-primary-foreground font-bold text-xl">P</span>
              </div>
              <span className="font-semibold text-xl tracking-tight group-hover:text-primary transition-colors">
                Postcard
              </span>
            </a>
          </div>
          
          <nav className="flex items-center gap-5">
            <div className="flex items-center text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50 border border-border/30">
              <span className="hidden sm:inline-block max-w-[180px] truncate">{user?.email}</span>
            </div>
            
            <ModeToggle />
            
            <Button 
              onClick={signOut} 
              variant="ghost" 
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              title="Sign Out"
            >
              <LogOut size={18} />
            </Button>
          </nav>
        </div>
      </header>

      {/* Background pattern */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-grid-pattern"></div>

      {/* Main Content */}
      <main className="flex-1 w-full relative z-10">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8"
            >
              <SearchArea />
              
              <TextInputArea />
              
              <div className="relative">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-semibold mr-auto">Your Journal</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">View all</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                </div>
                <EntryList />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6 mt-8 relative z-10 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-md bg-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with AI-powered journaling
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Postcard
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
