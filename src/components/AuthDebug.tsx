import { useAuth } from "react-oidc-context";

function AuthDebug() {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_AUTHORITY;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri || "")}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div style={{ padding: "20px", fontFamily: "monospace" }}>
        <pre>Hello: {auth.user?.profile?.email}</pre>
        <pre>ID Token: {auth.user?.id_token}</pre>
        <pre>Access Token: {auth.user?.access_token}</pre>
        <pre>Refresh Token: {auth.user?.refresh_token}</pre>

        <div style={{ marginTop: "20px" }}>
          <button 
            onClick={() => auth.removeUser()} 
            style={{ marginRight: "10px", padding: "10px 20px" }}
          >
            Sign out (Local)
          </button>
          <button 
            onClick={signOutRedirect}
            style={{ padding: "10px 20px" }}
          >
            Sign out (Cognito)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button 
        onClick={() => auth.signinRedirect()}
        style={{ padding: "10px 20px", marginRight: "10px" }}
      >
        Sign in
      </button>
      <button 
        onClick={() => signOutRedirect()}
        style={{ padding: "10px 20px" }}
      >
        Sign out
      </button>
    </div>
  );
}

export default AuthDebug;