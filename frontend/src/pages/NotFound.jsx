
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05070d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* 🔵 Background glow */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(0,255,255,0.08), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* 🧠 Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: "center",
          zIndex: 2,
          maxWidth: "500px",
        }}
      >
        {/* 404 Number */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: "clamp(4rem, 10vw, 7rem)",
            fontWeight: "800",
            color: "#00FFFF",
            marginBottom: "10px",
            textShadow: "0 0 20px rgba(0,255,255,0.6)",
          }}
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: "1.5rem",
            color: "#ffffff",
            marginBottom: "12px",
          }}
        >
          Lost in the system...
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            color: "rgba(255,255,255,0.7)",
            marginBottom: "30px",
            lineHeight: 1.6,
          }}
        >
          The page you’re looking for doesn’t exist or has been moved.
          Let’s get you back on track.
        </motion.p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            style={{
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              background: "#00FFFF",
              color: "#05070d",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Go Home
          </motion.button>
        </div>

        {/* Extra hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: "40px",
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Or try searching something else 🔍
        </motion.div>
      </motion.div>
    </div>
  );
}
