// Components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        © {new Date().getFullYear()} MockMate. All rights reserved.
      </p>
      <p style={styles.subText}>
        Built with ❤️ to help you ace your interviews.
      </p>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#1b1b1cff",
    color: "#ffffff",
    textAlign: "center",
    padding: "15px 0",
    
  },
  text: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "500",
  },
  subText: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#9ca3af",
  },
};
