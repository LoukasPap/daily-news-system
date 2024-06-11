import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Divider,
  Text,
  Input,
  InputGroup,
  AbsoluteCenter,
  Button,
  InputRightElement,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [usernameRegister, setUsernameRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [passwordVerification, setPasswordVerification] =
    useState("");
  const [email, setEmail] = useState("");
  const [errorRegister, setErrorRegister] = useState("");

  const [loading, setLoading] = useState(false);
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${window.apiIP}/verify-token/${token}`);

        if (response.ok) {
          console.log("LOGIN OK RESPONSE?");
          console.log(response);
          throw new Error("Not allowed in login page");
        } else {
          console.log("what");
        }
      } catch (error) {
        navigate("/home", { replace: true });
      }
    };

    verifyToken();
  }, []);

  const validateForm = (is_register) => {
    if (!is_register) {
      if (!username || !password) {
        setError("Username and password are required");
        return false;
      }
      setError("");
      return true;
    } else {
      if (passwordRegister != passwordVerification) {
        setErrorRegister("Passwords don't match!");
        return false;
      }
      console.log("Passwords match")
      setErrorRegister("");
      return true;

    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm(false)) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("username", username);
    formDetails.append("password", password);

    try {
      const response = await fetch(`${window.apiIP}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDetails,
      });

      setLoading(false);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        navigate("/home");
      } else {
        console.log("NOT OKK");
        const errorData = await response.json();
        setError(errorData.detail || "Authentication failed!");
      }
    } catch (error) {
      setLoading(false);
      setError("An error occured. Please try again later.");
      console.log("NOT OKK2");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validateForm(true)) return;
    setLoading(true);

    const formDetails = new URLSearchParams();
    formDetails.append("username", usernameRegister);
    formDetails.append("password", passwordRegister);
    formDetails.append("email", email);

    try {
      const response = await fetch(`${window.apiIP}/register-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDetails,
      });

      setLoading(false);

      if (response.ok) {
        const data = await response.json();
        console.log("OK RESPONSE");
        navigate("/")
      } else {
        console.log("NOT OK");
        const errorData = await response.json();
        setErrorRegister(errorData.detail || "Registration failed!");
      }
    } catch (error) {
      setLoading(false);
      setError("An error occured. Please try again later.");
    }
  };

  return (
    <Flex
      h="100%"
      p="0"
      mt="10"
      direction="column"
      alignContent="center"
      alignItems="center"
      justifyContent="center"
    >
      <Box textAlign="center">
        <Heading fontSize="7xl" color="#FF3131" fontWeight="500">
          Early<br></br> Bird
        </Heading>
        <Text fontWeight="400" fontSize="lg">
          A daily standard
        </Text>
      </Box>

      <Text mt="5" fontSize="3xl" color="black">
        Log in to your account
      </Text>
      <Box mt="5">
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              _hover={{ border: "1px solid #FF3131" }}
              size="lg"
              border="1px solid #353535"
              borderRadius="0"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <FormLabel mt="3">Password</FormLabel>
            <InputGroup>
              <Input
                _hover={{ border: "1px solid #FF3131" }}
                size="lg"
                border="1px solid #353535"
                borderRadius="0"
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="10"
                  border="1px solid #353535"
                  borderRadius="0"
                  onClick={handleClick}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Button
              w="100%"
              _hover={{ bg: "#353535", color: "white" }}
              mt="3"
              bg="#353535"
              color="white"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            {error && (
              <Text mt="3" style={{ color: "red" }}>
                {" "}
                {error}{" "}
              </Text>
            )}
          </FormControl>
        </form>
      </Box>

      <Box position="relative" padding="10">
        <Divider orientation="horizontal" bg="black" w="40" variant="dashed" />{" "}
        <AbsoluteCenter bg="black" color="white" px="4">
          or
        </AbsoluteCenter>
      </Box>

      <Text fontSize="3xl" color="black">
        Create an account
      </Text>

      <Box mb="10">
        <form onSubmit={handleRegister}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              _hover={{ border: "1px solid #FF3131" }}
              size="lg"
              border="1px solid #353535"
              borderRadius="0"
              type="text"
              placeholder="Enter username"
              value={usernameRegister}
              onChange={(e) => setUsernameRegister(e.target.value)}
            />

            <FormLabel mt="3">Email</FormLabel>
            <Input
              _hover={{ border: "1px solid #FF3131" }}
              size="lg"
              border="1px solid #353535"
              borderRadius="0"
              type="text"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormLabel mt="3">Password</FormLabel>
            <InputGroup isRequired>
              <Input
                _hover={{ border: "1px solid #FF3131" }}
                size="lg"
                border="1px solid #353535"
                borderRadius="0"
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter password"
                value={passwordRegister}
                onChange={(e) => setPasswordRegister(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="10"
                  border="1px solid #353535"
                  borderRadius="0"
                  onClick={handleClick}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <FormLabel mt="3">Verify Password</FormLabel>
            <InputGroup isRequired>
              <Input
                _hover={{ border: "1px solid #FF3131" }}
                size="lg"
                border="1px solid #353535"
                borderRadius="0"
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Enter password"
                value={passwordVerification}
                onChange={(e) =>
                  setPasswordVerification(e.target.value)
                }
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="10"
                  border="1px solid #353535"
                  borderRadius="0"
                  onClick={handleClick}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Button
              w="100%"
              _focus={{ bg: "#353535", color: "white" }}
              mt="5"
              variant="outline"
              colorScheme="black"
              type="submit"
              disabled={loading}
            >
              {loading ? "..." : "Register"}
            </Button>
            {errorRegister && (
              <Text mt="2" style={{ color: "red" }}>
                {" "}
                {errorRegister}{" "}
              </Text>
            )}
          </FormControl>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
