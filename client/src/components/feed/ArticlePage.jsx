import React, { useState, useEffect } from "react";
import { useLocation, Link as RRLink, useNavigate, redirect } from "react-router-dom";
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
  IconButton,
  Button
} from "@chakra-ui/react";
import BranchSVG from "../svg_components/BranchSVG";
import DOMPurify from "dompurify";

const ArticlePage = () => {
  const [username, setUsername] = useState([]);
  const [articleBody, setArticleBody] = useState("");

  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state === null) {
      console.log(state);
      navigate("/home", { state: { error: "Bad article ID" } });
    }
    console.log("Good article ID");
    setArticleBody(
      DOMPurify.sanitize(
        state.data.body.replaceAll(
          "<h2>",
          `<br><br><h2 style="font-size:1.5em; font-weight:300; color:#C5C909;">`
        )
      )
    );
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
      } else {
        console.log("Bad token!");
        navigate("/", { replace: true });
      }
    };

    getUser();
  }, []);

  return (
    <Box>
      {state && state.data ? "" : ""}

      <Flex justifyContent="center">
        <VStack
          alignItems="start"
          // border={"2px black solid"}
          w="75%"
          pl="5"
          pr="5"
          h="100%"
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            zIndex="1"
            w="100%"
            h="100px"
            bg="#F5FFE4"
            position="sticky"
            top="0"
            pt="4"
            borderBottom="2px solid #FF3131"
            // backdropFilter="blur(5px)"
          >
            <RRLink to={`/home`}>
              <Heading
                as={"h1"}
                fontWeight={"400"}
                fontStyle={"normal"}
                fontSize={"3em"}
                color="#FF3131"
                alignSelf="end"
              >
                early bird
              </Heading>
              <Text mb="5px" fontFamily="Modern No. 20" fontSize="2xl">
                a daily standard
              </Text>
            </RRLink>

            <HStack>
              <Text fontSize="xl">
                {username && username != " " ? username : "-:-"}
              </Text>
              <Avatar
                name="Dan Abrahmov"
                size="lg"
                src="https://bit.ly/code-beast"
              />
            </HStack>
          </Flex>

          <Box
            w="100%"
            bg="#1F1F1F"
            borderBottomEndRadius="30px"
            borderBottomStartRadius="30px"
            p="20"
          >
            <Flex
              // border="2px solid blue"
              justifyContent="space-between"
              alignItems="center"
              mb="2"
            >
              {/* <Button
                // isRound={true}
                bg="transparent"
                // border="1px"
                // borderColor="red.800"
                // color="white"
                _hover={{ color: "white"}}
                leftIcon={<BranchSVG/>}
                >
                  Branch it
              </Button> */}
                <BranchSVG></BranchSVG>

              <Text
                color="#A7A7A7"
                textAlign="center"
                fontSize="xl"
                fontWeight="200"
              >
                {state && state.data
                  ? `${state.data.datetime} ⬝ ${state.data.new_site} ⬝ ${state.data.category}`
                  : ""}
              </Text>

              <Link
                color="#C5C909"
                fontSize="xl"
                fontWeight="200"
                href={state && state.data ? state.data._id : ""}
                isExternal={true}
              >
                <u>source</u>
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

            <HStack direction="row" mt="5" justifyContent="center">
              {state && state.data
                ? state.data.authors.map((author) => (
                    <>
                      <Avatar name={author} size="sm" zIndex="-0" />
                      <Text color="#A7A7A7" fontWeight="200" fontSize="xl">
                        {author}
                      </Text>
                    </>
                  ))
                : ""}
            </HStack>

            <Text color="#FFF" mt="5" fontSize="2xl" fontWeight="200">
              {/* {state && state.data ? state.data.body : ""} */}
              <div dangerouslySetInnerHTML={{ __html: articleBody }} />
            </Text>
          </Box>

          <Text textAlign="center" m="5" w="100%">
            ©2024 Early Bird Greece, Inc. All rights reserved.
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ArticlePage;
