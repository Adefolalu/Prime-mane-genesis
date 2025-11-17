import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { supabase } from "./supabase";

function App() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [isOnWhitelist, setIsOnWhitelist] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Auto-connect wallet when mini app opens
  useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connectors, connect]);

  // Check if address is already on whitelist
  useEffect(() => {
    const checkWhitelistStatus = async () => {
      if (address) {
        const { data } = await supabase
          .from("whitelist")
          .select("*")
          .eq("wallet_address", address)
          .single();

        if (data) {
          setIsOnWhitelist(true);
        }
      }
    };

    checkWhitelistStatus();
  }, [address]);

  const handleJoinWhitelist = async () => {
    if (!address) {
      setError("Please connect your wallet first.");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      console.log("Attempting to join whitelist with address:", address);

      // First, check if already on whitelist
      const { data: existingEntry } = await supabase
        .from("whitelist")
        .select("*")
        .eq("wallet_address", address)
        .single();

      if (existingEntry) {
        console.log("Address already on whitelist");
        setIsOnWhitelist(true);
        setIsJoining(false);
        return;
      }

      // Insert new entry
      const { data, error } = await supabase
        .from("whitelist")
        .insert([{ wallet_address: address }])
        .select();

      console.log("Insert result:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        // Check if it's a duplicate entry error
        if (error.code === "23505" || error.message.includes("duplicate")) {
          setIsOnWhitelist(true);
        } else {
          // More detailed error message
          setError(`Error: ${error.message}. Check console for details.`);
        }
      } else {
        console.log("Successfully joined whitelist!");
        setIsOnWhitelist(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(
        `Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    const text =
      "I just joined the Prime Mane Genesis whitelist! First Solana collection on Farcaster 🦁";

    const imageUrl =
      "https://aquamarine-wilful-anglerfish-677.mypinata.cloud/ipfs/bafybeiacoqtk3ojuwjlya6h7j3juwl7ggstrhyhzvyltmbjsr6qtm6aviy";
    const miniappUrl = "https://prime-mane-genesis.vercel.app";

    // SDK expects embeds as [] | [string] | [string, string]
    // Provide [imageUrl, miniappUrl] to attach image + link
    const embeds: [string, string] = [imageUrl, miniappUrl];

    try {
      await sdk.actions.composeCast({ text, embeds });
      console.log("composeCast sent");
    } catch (err) {
      console.error("composeCast error:", err);
      // Fallback to opening the web composer if composeCast fails
      const fallbackUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
        text
      )}`;
      sdk.actions.openUrl(fallbackUrl);
    }
  };

  if (!isConnected) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "20px",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            🦁
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#2596be",
              marginBottom: "10px",
            }}
          >
            Prime Mane Genesis
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Connecting your wallet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 8px 32px 0 rgba(37, 150, 190, 0.2)",
          border: "1px solid rgba(37, 150, 190, 0.3)",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          🦁
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#2596be",
            textAlign: "center",
            marginBottom: "10px",
            textShadow: "0 0 20px rgba(37, 150, 190, 0.5)",
          }}
        >
          Prime Mane Genesis
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          First Solana NFT Collection on Farcaster
        </p>

        <div
          style={{
            background: "rgba(37, 150, 190, 0.1)",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "1px solid rgba(37, 150, 190, 0.3)",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#2596be",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: "600",
            }}
          >
            Connected Wallet
          </p>
          <p
            style={{
              fontSize: "14px",
              fontFamily: "monospace",
              margin: 0,
              color: "rgba(255, 255, 255, 0.9)",
              wordBreak: "break-all",
            }}
          >
            {address}
          </p>
        </div>

        {!isOnWhitelist ? (
          <>
            <button
              type="button"
              onClick={handleJoinWhitelist}
              disabled={isJoining}
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "18px",
                fontWeight: "700",
                background: isJoining
                  ? "rgba(37, 150, 190, 0.5)"
                  : "linear-gradient(135deg, #2596be 0%, #1a7a9e 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isJoining ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: isJoining
                  ? "none"
                  : "0 4px 15px 0 rgba(37, 150, 190, 0.4)",
                transform: isJoining ? "scale(0.98)" : "scale(1)",
              }}
              onMouseOver={(e) => {
                if (!isJoining) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px 0 rgba(37, 150, 190, 0.6)";
                }
              }}
              onMouseOut={(e) => {
                if (!isJoining) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px 0 rgba(37, 150, 190, 0.4)";
                }
              }}
            >
              {isJoining ? "Joining..." : "Join Whitelist"}
            </button>
            {error && (
              <p
                style={{
                  color: "#ff6b6b",
                  marginTop: "15px",
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
          </>
        ) : (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                padding: "20px",
                borderRadius: "12px",
                marginBottom: "20px",
                boxShadow: "0 4px 15px 0 rgba(16, 185, 129, 0.3)",
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontWeight: "700", fontSize: "18px" }}>
                ✓ You're on the whitelist!
              </p>
            </div>

            <button
              type="button"
              onClick={handleShare}
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "18px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #2596be 0%, #1a7a9e 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px 0 rgba(37, 150, 190, 0.4)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px 0 rgba(37, 150, 190, 0.6)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px 0 rgba(37, 150, 190, 0.4)";
              }}
            >
              Share on Farcaster
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
