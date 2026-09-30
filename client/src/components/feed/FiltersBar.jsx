import React, { useState } from "react";
import { Flex, Tabs, TabList, Tab } from "@chakra-ui/react";
import CategoryFilter from "./CategoryFilter";

const tabStyle = {
  w: { base: "auto", md: "140px" },
  flex: { base: 1, md: "none" },
  px: { base: 2, md: 4 },
  h: "30px",
  borderRadius: "10px",
  border: "2px dashed #303030",
  bg: "transparent",
  textAlign: "center",
  fontSize: { base: "md", md: "lg" },
  fontWeight: "400",
  color: "#303030",
  _hover: { bg: "#BABABA" },
  _selected: { bg: "#303030", color: "#FFF" },
};

const FilterBar = ({ onFeedFetch, isHeaderVisible }) => {
  // feed type (tab) and article categories (filter pill) are combined in one request
  const [feedType, setFeedType] = useState("latest");
  const [categories, setCategories] = useState([]);

  const fetchFeed = async (type, cats) => {
    const token = localStorage.getItem("token");
    const filter = cats.length ? cats.join(",") : "all";
    const request = await fetch(
      `${window.apiIP}/feed?category=${type}&filter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const response = await request.json();
    onFeedFetch(response);
  };

  const getFeed = (event, type) => {
    setFeedType(type);
    fetchFeed(type, categories);
  };

  const changeCategories = (cats) => {
    setCategories(cats);
    fetchFeed(feedType, cats);
  };

  return (
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
      <Flex align="center" wrap="wrap" rowGap="3" columnGap="4">
        <TabList flex={{ base: "1 1 100%", md: "0 0 auto" }}>
          <Tab {...tabStyle} onClick={(e) => getFeed(e, "latest")}>
            Latest
          </Tab>
          <Tab
            {...tabStyle}
            ml={{ base: 2, md: 5 }}
            onClick={(e) => getFeed(e, "trend")}
          >
            Trend
          </Tab>
          <Tab
            {...tabStyle}
            ml={{ base: 2, md: 4 }}
            onClick={(e) => getFeed(e, "personalized")}
          >
            Personalized
          </Tab>
        </TabList>

        <CategoryFilter value={categories} onChange={changeCategories} />
      </Flex>
    </Tabs>
  );
};

export default FilterBar;
