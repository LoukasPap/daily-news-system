import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  Avatar,
  Flex,
  Text,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Portal,
  useBreakpointValue,
} from "@chakra-ui/react";
import ArticlesOrder from "./feed/ArticlesOrder";
import FilterBar from "./feed/FiltersBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsVisible } from "./custom_hooks/useIsVisible";

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState([]);
  const [email, setEmail] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();

  const ref = useRef();
  const isVisible = useIsVisible(ref);
  const popoverPlacement = useBreakpointValue({ base: "bottom-end", md: "start" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const getFeed = async () => {
      const request = await fetch(`${window.apiIP}/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await request.json();

      if (Array.isArray(response)) {
        setFeed(response);
      } else {
        navigate("/");
      }
    };

    getFeed();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const request = await fetch(`${window.apiIP}/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const response = await request.json();

      if (response && response.data) {
        setUsername(response.data.username);
        setEmail(response.data.email);
      } else {
        console.log("Bad token!");
        navigate("/", { replace: true });
      }
    };

    getUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/", { replace: true });
  };

  return (
    <Box bg="#FAF9DD" minH="100vh">
      {state && state.error ? (
        <Alert status="error" justifyContent="center">
          <AlertIcon />
          <AlertTitle>{state.error}</AlertTitle>
        </Alert>
      ) : null}
      <Box visibility="hidden" h={{ base: "40px", md: "100px" }}></Box>

      <Flex justifyContent="center">
        <VStack
          alignItems="start"
          spacing={{ base: "22px", md: 2 }}
          w={{ base: "100%", xl: "75%" }}
          px={{ base: "30px", md: 5 }}
          h="100%"
        >
          <Flex
            w="100%"
            alignItems={{ base: "start", md: "end" }}
            justify="space-between"
            ref={ref}
          >
            <Flex direction={{ base: "column", md: "row" }}>
              <Heading
                as={"h1"}
                fontWeight={{ base: "350", md: "400" }}
                fontStyle={"normal"}
                fontSize={{ base: "40px", md: "5em" }}
                lineHeight="normal"
                color="#FF3131"
                alignSelf={{ base: "start", md: "end" }}
              >
                <Text alignSelf="end" h="100%">
                  early <br /> bird
                </Text>
              </Heading>
              <Text
                alignSelf={{ base: "start", md: "end" }}
                mt={{ base: "13px", md: 0 }}
                mb={{ base: 0, md: "5px" }}
                fontFamily="'Modern No. 20', serif"
                fontSize={{ base: "29px", md: "2xl" }}
                lineHeight="normal"
                color="black"
              >
                a daily standard
              </Text>
            </Flex>

            <HStack mr={{ base: 0, md: 5 }}>
              <Popover placement={popoverPlacement}>
                <PopoverTrigger>
                  <Avatar
                    _hover={{ opacity: "80%" }}
                    border="1px solid black"
                    p="0.5"
                    borderBottomStartRadius={0}
                    size={{ base: "md", md: "xl" }}
                    src="https://bit.ly/code-beast"
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent border="1px solid black">
                    <PopoverHeader>
                      {" "}
                      {username && username != " ff" ? username : "-:-"} -{" "}
                      {email && email != " ff" ? email : "-:-"}
                    </PopoverHeader>
                    <PopoverCloseButton color="black" />
                    <PopoverBody borderTop="1px solid black">
                      Do you want to logout?{" "}
                      <Button
                        ml="3"
                        colorScheme="red"
                        onClick={(e) => handleLogout()}
                      >
                        Logout
                      </Button>
                    </PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
              <Text fontSize="xl" textAlign="end"></Text>
            </HStack>
          </Flex>

          <FilterBar
            onFeedFetch={setFeed}
            isHeaderVisible={isVisible ? "true" : "false"}
          />

          <ArticlesOrder data={feed} />
        </VStack>
      </Flex>
      <Text textAlign="center" p="5">
        ©2024 Early Bird Greece, Inc. All rights reserved.
      </Text>
    </Box>
  );
};

export default Home;
