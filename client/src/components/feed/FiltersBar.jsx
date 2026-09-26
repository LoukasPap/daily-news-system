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
      bg="#FAF9DD"
      zIndex="1"
      pt={{ base: 3, md: 5 }}
      pb={{ base: 3, md: 5 }}
    >
      <TabList>
        {/* <Tab
          color="#FF3131"
          fontWeight="500"
          mr="4"
          fontFamily="KyivType Titling"
          fontSize={{ base: "md", md: "lg" }}
        >
          {isHeaderVisible === "false" ? "early bird" : null}
        </Tab> */}

        <Tab
          w={{ base: "auto", md: "140px" }}
          flex={{ base: 1, md: "none" }}
          px={{ base: 2, md: 4 }}
          h="30px"
          borderRadius="10px"
          border="2px dashed #303030"
          bg="transparent"
          textAlign="center"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="400"
          color="#303030"
          _hover={{ bg: "#BABABA" }}
          _selected={{ bg: "#303030", color: "#FFF" }}
          onClick={(e) => getFeed(e, "latest")}
        >
          Latest
        </Tab>
        <Tab
          w={{ base: "auto", md: "140px" }}
          flex={{ base: 1, md: "none" }}
          px={{ base: 2, md: 4 }}
          h="30px"
          ml={{ base: 2, md: 5 }}
          borderRadius="10px"
          border="2px dashed #303030"
          bg="transparent"
          textAlign="center"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="400"
          color="#303030"
          _hover={{ bg: "#BABABA" }}
          _selected={{ bg: "#303030", color: "#FFF" }}
          onClick={(e) => getFeed(e, "trend")}
        >
          Trend
        </Tab>
        <Tab
          w={{ base: "auto", md: "140px" }}
          flex={{ base: 1, md: "none" }}
          px={{ base: 2, md: 4 }}
          h="30px"
          ml={{ base: 2, md: 4 }}
          borderRadius="10px"
          border="2px dashed #303030"
          bg="transparent"
          textAlign="center"
          fontSize={{ base: "md", md: "lg" }}
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

  );
};

export default FilterBar;
