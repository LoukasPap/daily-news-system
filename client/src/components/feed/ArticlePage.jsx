import React, { useState, useEffect } from "react";
import {
  useLocation,
  Link as RRLink,
  useNavigate,
  redirect,
} from "react-router-dom";
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
  useToast,
} from "@chakra-ui/react";
import BranchSVG from "../svg_components/BranchSVG";
import BranchSVG_clicked from "../svg_components/BranchSVG_clicked";
import DOMPurify from "dompurify";
import TimeMe from "timeme.js";

const ArticlePage = () => {
  const [username, setUsername] = useState([]);
  const [articleBody, setArticleBody] = useState("");
  const [liked, setLiked] = useState(false);

  const toast = useToast();
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
        const article = response.data.reads_history.find(
          (element) => element.aid === state.data._id
        );
        setLiked(article.is_liked);
      } else {
        console.log("Bad token!");
        navigate("/", { replace: true });
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    // Initialize TimeMe
    TimeMe.initialize({
      currentPageName: Math.floor(Math.random() * Date.now()).toString(36), // Optional, name of the page
      idleTimeoutInSeconds: 30, // Optional, time in seconds before user is considered idle
    });

    // Start tracking time on page
    TimeMe.startTimer();

    const handleBeforeUnload = () => {
      // Stop the timer when the page is about to be unloaded
      TimeMe.stopTimer();

      // Optionally, you can get the time spent on the page
      const timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();
      console.log(`Unload - Time spent on page: ${timeSpentOnPage} seconds`);
    };

    // Add event listener for beforeunload and unload events
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleBeforeUnload);

    return () => {
      // Cleanup the event listener when the component is unmounted
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleBeforeUnload);

      // Stop the timer if the component is unmounted for any reason
      TimeMe.stopTimer();

      // Optionally, you can get the time spent on the page
      const timeSpentOnPage = TimeMe.getTimeOnCurrentPageInSeconds();

      fetch(`${window.apiIP}/add_read_time`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aid: state.data._id,
          time_spent: timeSpentOnPage,
          estimated_rt: state.data.estimated_reading_time,
        }),
      })
        .then((res) => {
          console.log(
            `Return - Time spent on page: ${timeSpentOnPage} seconds`
          );
          console.log("Like results:", res);
        })
        .catch((err) => {
          throw new Error(err);
        });
    };
  }, []);

  const likeArticle = async (username, article_id) => {
    console.log("like");

    fetch(`${window.apiIP}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, aid: article_id }),
    })
      .then((res) => {
        console.log(`${username} liked article: ${article_id}`);
        console.log("Like results:", res);
      })
      .catch((err) => {
        throw new Error(err);
      });
  };
  return (
    <Box>
      {state && state.data ? "" : ""}

      <Flex justifyContent="center">
        <VStack
          alignItems="start"
          // border={"2px black solid"}
          w={{ base: "100%", xl: "75%" }}
          px={{ base: 4, md: 5 }}
          h="100%"
        >
          <Flex
            justifyContent="space-between"
            alignItems="center"
            zIndex="1"
            w="100%"
            minH={{ base: "auto", md: "100px" }}
            bg="#F5FFE4"
            position="sticky"
            top="0"
            pt={{ base: 3, md: 4 }}
            pb={{ base: 2, md: 0 }}
            borderBottom="2px solid #FF3131"
            // backdropFilter="blur(5px)"
          >
            <RRLink to={`/home`}>
              <Heading
                as={"h1"}
                fontWeight={"400"}
                fontStyle={"normal"}
                fontSize={{ base: "2em", md: "3em" }}
                lineHeight="normal"
                color="#FF3131"
                alignSelf="end"
              >
                early bird
              </Heading>
              <Text
                mb="5px"
                fontFamily="'Modern No. 20', serif"
                fontSize={{ base: "lg", md: "2xl" }}
              >
                a daily standard
              </Text>
            </RRLink>

            <HStack>
              <Text fontSize="xl" display={{ base: "none", sm: "block" }}>
                {username && username != " " ? username : "-:-"}
              </Text>
              <Avatar
                name="Prof Pictur"
                border="1px solid black"
                p="0.5"
                size={{ base: "md", md: "lg" }}
                src="https://bit.ly/code-beast"
              />
            </HStack>
          </Flex>

          <Box
            w="100%"
            bg="#1F1F1F"
            borderBottomEndRadius={{ base: "20px", md: "30px" }}
            borderBottomStartRadius={{ base: "20px", md: "30px" }}
            p={{ base: 5, md: 10, lg: 20 }}
          >
            <Flex
              // border="2px solid blue"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              columnGap="4"
              mb="2"
            >
              <IconButton
                bg="transparent"
                _hover={{ bg: "" }}
                _active={{ bg: "" }}
                onClick={() => {
                  setLiked(!liked);
                  console.log("clicked");
                  likeArticle(username, state.data._id);
                  if (!liked) {
                    toast({
                      title: "You liked the article",
                      status: "success",
                      duration: 3000,
                      variant: "subtle",
                      isClosable: true,
                    });
                  }
                }}
                icon={liked ? <BranchSVG_clicked /> : <BranchSVG />}
              />

              {/* on phones the meta line drops below the like / source row */}
              <Text
                color="#A7A7A7"
                textAlign="center"
                fontSize={{ base: "sm", md: "xl" }}
                fontWeight="200"
                order={{ base: 1, md: 0 }}
                flexBasis={{ base: "100%", md: "auto" }}
                flexShrink="1"
                minW="0"
              >
                {state && state.data
                  ? `${state.data.datetime} ⬝ ${state.data.new_site} ⬝ ${
                      state.data.category
                    } - ${
                      Math.ceil(state.data.estimated_reading_time / 60) +
                      " mins"
                    }`
                  : ""}
              </Text>

              <Link
                color="#C5C909"
                fontSize={{ base: "md", md: "xl" }}
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
              fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
              textAlign="center"
              mt={{ base: 3, md: 0 }}
              overflowWrap="anywhere"
            >
              {state && state.data ? state.data.title : ""}
            </Heading>

            <Flex
              mt="5"
              justifyContent="center"
              flexWrap="wrap"
              columnGap="4"
              rowGap="2"
            >
              {state && state.data
                ? state.data.authors.map((author, index) => (
                    <HStack key={`${author}-${index}`}>
                      <Avatar name={author} size="sm" zIndex="-0" />
                      <Text
                        color="#A7A7A7"
                        fontWeight="200"
                        fontSize={{ base: "md", md: "xl" }}
                      >
                        {author}
                      </Text>
                    </HStack>
                  ))
                : ""}
            </Flex>

            <Box
              color="#FFF"
              mt="5"
              fontSize={{ base: "lg", md: "2xl" }}
              fontWeight="200"
              overflowWrap="anywhere"
              // keep scraped media / tables inside the box on small screens
              sx={{
                "& img, & video, & iframe": { maxW: "100%", h: "auto" },
                "& table, & pre": { display: "block", maxW: "100%", overflowX: "auto" },
              }}
            >
              {/* {state && state.data ? state.data.body : ""} */}
              <div dangerouslySetInnerHTML={{ __html: articleBody }} />
            </Box>
          </Box>

          <Text textAlign="center" p="5" w="100%">
            ©2024 Early Bird Greece, Inc. All rights reserved.
          </Text>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ArticlePage;
