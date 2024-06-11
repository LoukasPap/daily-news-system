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
    <>
      {state && state.error ? (
        <Alert status="error" justifyContent="center">
          <AlertIcon />
          <AlertTitle>{state.error}</AlertTitle>
        </Alert>
      ) : null}
      <Box visibility="hidden" h="100px"></Box>

      <Flex justifyContent="center">
        <VStack
          alignItems="start"
          // border={"2px black solid"}
          w="75%"
          pl="5"
          pr="5"
          h="100%"
        >
          <Flex w="100%" alignItems="end" justify="space-between" ref={ref}>
            <Flex>
              <Heading
                as={"h1"}
                fontWeight={"400"}
                fontStyle={"normal"}
                fontSize={"5em"}
                color="#FF3131"
                alignSelf="end"
              >
                <Text alignSelf="end" h="100%">
                  early <br /> bird
                </Text>
              </Heading>
              <Text
                alignSelf="end"
                mb="5px"
                fontFamily="Modern No. 20"
                fontSize="2xl"
                h="100%"
              >
                a daily standard
              </Text>
            </Flex>

            <HStack mr="5">
              <Popover placement="start">
                <PopoverTrigger>
                  <Avatar
                    _hover={{ opacity: "80%" }}
                    border="1px solid black"
                    p="0.5"
                    borderBottomStartRadius={0}
                    size="xl"
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
      <Text textAlign="center" m="5" w="100%">
        ©2024 Early Bird Greece, Inc. All rights reserved.
      </Text>
    </>
  );
};

export default Home;
