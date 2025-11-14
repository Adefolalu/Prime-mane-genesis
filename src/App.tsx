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
          joined_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        // Check if it's a duplicate entry error
        if (error.code === "23505") {
          setIsOnWaitlist(true);
        } else {
          throw error;
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
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Prime Mane Genesis</h1>
        <p>Connecting your wallet...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h1>🦁 Prime Mane Genesis</h1>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
        First Solana NFT Collection on Farcaster
      </p>

      <div
        style={{
          background: "#f5f5f5",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          wordBreak: "break-all",
        }}
      >
        <p style={{ fontSize: "12px", color: "#888", margin: "0 0 5px 0" }}>
          Connected Wallet
        </p>
        <p style={{ fontSize: "14px", fontFamily: "monospace", margin: 0 }}>
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
              padding: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#8B5CF6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isJoining ? "not-allowed" : "pointer",
              opacity: isJoining ? 0.7 : 1,
            }}
          >
            {isJoining ? "Joining..." : "Join Waitlist"}
          </button>
          {error && (
            <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
              {error}
            </p>
          )}
        </>
      ) : (
        <div>
          <div
            style={{
              background: "#10b981",
              color: "white",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              ✓ You're on the waitlist!
            </p>
          </div>

          <button
            type="button"
            onClick={handleShare}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#8B5CF6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Share on Farcaster
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
