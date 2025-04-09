import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Button } from "@/components/ui/button";
import { TextInputArea } from "@/components/TextInputArea";

function App() {
  const { session, user, signOut } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Postcard</h1>
        <div>
          <span className="mr-4 text-sm">Welcome, {user?.email}!</span>
          <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
        </div>
      </div>

      <TextInputArea />

      {/* TODO: Add components for displaying entries, search, etc. */}
    </div>
  );
}

export default App;
