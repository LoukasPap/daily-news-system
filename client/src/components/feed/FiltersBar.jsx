import React from "react";
import { Heading, Tabs, TabList, Tab } from "@chakra-ui/react";

const FilterBar = ({ onFeedFetch, isHeaderVisible }) => {
  // const [feed, setFeed] = useState();

  const getFeed = async (event, category) => {
    const token = localStorage.getItem("token");
    const request = await fetch(`${window.apiIP}/feed?category=${category}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await request.json();
    onFeedFetch(response);
  };

  return (
    // <HStack mt="15px" mb="15px">
    <Tabs
      isLazy
      variant="unstyled"
      position="sticky"
      w="100%"
      top="0"
      bg="#F5FFE4"
      zIndex="1"
      pt="5"
      pb="5"
    >
      <TabList>
        {/* <Tab
          color="#FF3131"
          fontWeight="500"
          mr="4"
          fontFamily="KyivType Titling"
          fontSize="lg"
        >
          {isHeaderVisible === "false" ? "early bird" : null}
        </Tab> */}

        <Tab
          w="140px"
          h="30px"
          borderRadius="10px"
          border="2px dashed #303030"
          bg="transparent"
          textAlign="center"
          fontSize="lg"
          fontWeight="400"
          color="#303030"
          _hover={{ bg: "#BABABA" }}
          _selected={{ bg: "#303030", color: "#FFF" }}
          onClick={(e) => getFeed(e, "latest")}
        >
          Latest
        </Tab>
        <Tab
          w="140px"
          h="30px"
          ml="5"
          borderRadius="10px"
          border="2px dashed #303030"
          bg="transparent"
          textAlign="center"
          fontSize="lg"
          fontWeight="400"
          color="#303030"
          _hover={{ bg: "#BABABA" }}
          _selected={{ bg: "#303030", color: "#FFF" }}
          onClick={(e) => getFeed(e, "trend")}
        >
          Trend
        </Tab>
        <Tab
          w="140px"
          h="30px"
          ml="4"
          borderRadius="10px"
          border="2px dashed #303030"
          bg="transparent"
          textAlign="center"
          fontSize="lg"
          fontWeight="400"
          color="#303030"
          _hover={{ bg: "#BABABA" }}
          _selected={{ bg: "#303030", color: "#FFF" }}
          onClick={(e) => getFeed(e, "personalized")}
        >
          Personalized
        </Tab>
      </TabList>
    </Tabs>

    // <Button
    //   w="140px"
    //   p="2"
    //   borderRadius="10px"
    //   border="2px dashed #303030"
    //   bg="transparent"
    //   textAlign="center"
    //   fontSize="lg"
    //   fontWeight="400"
    //   color="#303030"
    //   // isActive="true"
    //   _hover={{ bg: "#BAC6A8" }}
    //   _focus={{ bg: "#303030", color: "#FFF" }}
    //   onClick={(e) => getFeed(e, "latest")}
    // >
    //   Latest
    // </Button>
    // <Button
    //   w="140px"
    //   p="2"
    //   borderRadius="10px"
    //   border="2px dashed #303030"
    //   bg="transparent"
    //   textAlign="center"
    //   fontSize="lg"
    //   fontWeight="400"
    //   color="#303030"
    //   _hover={{ bg: "#BAC6A8" }}
    //   _active={{ bg: "#303030", color: "#FFF" }}
    // >
    //   Trends
    // </Button>
    // <Button
    //   w="140px"
    //   p="2"
    //   borderRadius="10px"
    //   border="2px dashed #303030"
    //   bg="transparent"
    //   textAlign="center"
    //   fontSize="lg"
    //   fontWeight="400"
    //   color="#303030"
    //   _hover={{ bg: "#BAC6A8" }}
    //   _active={{ bg: "#303030", color: "#FFF" }}
    // >
    //   Personalized
    // </Button>
    // </HStack>
  );
};

export default FilterBar;
