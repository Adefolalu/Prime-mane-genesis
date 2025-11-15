import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { supabase } from "./supabase";

function App() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
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

  // Check if address is already on waitlist
  useEffect(() => {
    const checkWaitlistStatus = async () => {
      if (address) {
        const { data } = await supabase
          .from("waitlist")
          .select("*")
          .eq("wallet_address", address)
          .single();

        if (data) {
          setIsOnWaitlist(true);
        }
      }
    };

    checkWaitlistStatus();
  }, [address]);

  const handleJoinWaitlist = async () => {
    if (!address) return;

    setIsJoining(true);
    setError(null);

    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          wallet_address: address,
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        // Check if it's a duplicate entry error
        if (error.code === "23505" || error.message.includes("duplicate")) {
          setIsOnWaitlist(true);
        } else {
          // More detailed error message
          setError(
            error.message || "Failed to join waitlist. Please try again."
          );
        }
      } else {
        setIsOnWaitlist(true);
      }
    } catch (err) {
      console.error("Error joining waitlist:", err);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = () => {
    const shareText =
      "I just joined the Prime Mane Genesis waitlist! First Solana collection on Farcaster 🦁";
    sdk.actions.openUrl(
      `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`
    );
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

        {!isOnWaitlist ? (
          <>
            <button
              type="button"
              onClick={handleJoinWaitlist}
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
              {isJoining ? "Joining..." : "Join Waitlist"}
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
                ✓ You're on the waitlist!
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
