import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Button } from "./components/ui/button";
import { TextInputArea } from "./components/TextInputArea";
import { EntryList } from "./components/EntryList";
import { SearchArea } from "./components/SearchArea";

function App() {
  const { session, user, signOut } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Postcard</h1>
        <div>
          <span className="mr-4 text-sm">Welcome, {user?.email}!</span>
          <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
        </div>
      </div>

      <SearchArea />

      <TextInputArea />

      <EntryList />
    </div>
  );
}

export default App;
