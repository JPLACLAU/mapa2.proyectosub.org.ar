import React from "react";

import Container from "./Container";

const Footer = () => {
  return (
    <footer>
      <Container>
        <p>&copy; {new Date().getFullYear()} ProyectoSub</p>
      </Container>
    </footer>
  );
};

export default Footer;
