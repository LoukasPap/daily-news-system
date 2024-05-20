import React, { useState, useEffect } from "react";
import { useLocation, Link as RRLink, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Stack,
  Avatar,
  HStack,
  Link,
} from "@chakra-ui/react";
import BranchSVG from "../svg_components/BranchSVG";

const ArticlePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getFeed = () => {
      if (state === null) {
        console.log("NUll");
        navigate("/home", { state: { error: "Bad article ID" } });
      }
      console.log("testesd");
    };

    getFeed();
  }, []);

  return (
    <Box>
      {state && state.data ? "" : ""}

      <Flex justifyContent={"center"}>
        <VStack
          alignItems={"start"}
          // border={"2px black solid"}
          w="75%"
          pl="5"
          pr="5"
          h="100%"
        >
          <Box visibility={"visible"} bg="green" w="100%" h={"100px"}>
            early bird
          </Box>
          <Box>hello</Box>

          <Box w="100%" mb="5" bg="#1F1F1F" borderRadius="30px" p="20">
            <Flex
              // border="2px solid blue"
              justifyContent="space-between"
              alignItems="center"
              mb="2"
              
            >
              <BranchSVG></BranchSVG>
              <Text
                color="#A7A7A7"
                textAlign="center"
                fontSize="xl"
                fontWeight="200">
                {state && state.data ?
                `${state.data.datetime} ⬝ ${state.data.new_site} ⬝ ${state.data.category}` :
                 ""}
              </Text>
            
              <Link
                color="#C5C909"
                fontSize="xl"
                fontWeight="200"
                href={state && state.data ? state.data._id : ""}
                isExternal={true}
              >
                source
              </Link>
            </Flex>

            <Heading
              color="#FFFFFF"
              fontWeight="400"
              fontSize="5xl"
              textAlign="center"
            >
              {state && state.data ? state.data.title : ""}
            </Heading>

            <Stack direction="row" mt="5" justifyContent={"center"}>
            {state && state.data ? state.data.authors.map((author) => (
                <HStack>
                  <Avatar name={author} size="sm" />
                  <Text color={"#A7A7A7"} fontWeight="200" fontSize={"xl"}>
                    {author}
                  </Text>
                </HStack>
              )) : ""}
            </Stack>

            <Text color="#FFF" mt="5" fontSize="23px" fontWeight="200">

            {state && state.data ? state.data.body : ""}
            </Text>
          </Box>


          <Text>
            {/* Recomends here */}
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ArticlePage;
