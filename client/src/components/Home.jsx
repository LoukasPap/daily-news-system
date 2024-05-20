import React, { useState, useEffect } from "react";
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
import { useLocation } from "react-router-dom";

const Home = ({ onDataFetch, userData }) => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const getFeed = async () => {
      const request = await fetch(`${window.apiIP}/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await request.json();

      if (response) {
        console.log(response);
        setFeed(response);
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
      <Box visibility={"hidden"} h={"100px"}></Box>

      <Flex justifyContent={"center"}>
        <VStack
          alignItems={"start"}
          // border={"2px black solid"}
          w="75%"
          pl="5"
          pr="5"
          h="100%"
        >
          <Flex alignItems="baseline">
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

          <FilterBar />

          <ArticlesOrder data={feed} />

          <Button mt="5" colorScheme="whatsapp" onClick={handleDataFetch}>
            Fetch {loading && <Spinner ml="3" size="sm" />}
          </Button>
        </VStack>
      </Flex>
    </>
  );
};

export default Home;
