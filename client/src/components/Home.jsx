import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  Button,
  Spinner,
  Flex,
  Text,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import ArticlesOrder from "./feed/ArticlesOrder";
import FilterBar from "./feed/FiltersBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsVisible } from "./custom_hooks/useIsVisible";

const Home = ({ onDataFetch, userData }) => {
  const navigate = useNavigate();
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

  const handleDataFetch = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${window.apiIP}/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const responseData = await response.json();
      console.log(responseData.data);
      onDataFetch(responseData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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
          <Flex alignItems="baseline" ref={ref}>
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
          
          <FilterBar onFeedFetch={setFeed} isHeaderVisible={isVisible ? "true" : "false"}/>

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
