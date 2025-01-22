import { useState, useEffect } from "react";
import CombinedAdminPanel from "./CombinedAdminPanel";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  //@ts-ignore
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");



  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);
  //@ts-ignore

  const handleLogin = (e) => {
    e.preventDefault();
   
    if (username === "xyz512") {
      setIsLoggedIn(true);
      setError("");
      localStorage.setItem("username", username);
    } else {
      setError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setError("");
    localStorage.removeItem("username");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="text-gray-600">Please Enter code</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleLogin}>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Admin Code
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
               */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mayabingo Bonus Setting</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="space-y-8">
          <CombinedAdminPanel />
          {/* <AdminPanel />
          <Table /> */}
        </div>
      </div>
    </div>
  );
};

export default App;