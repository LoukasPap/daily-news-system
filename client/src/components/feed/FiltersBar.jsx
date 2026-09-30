import React, { useState, useEffect } from "react";
import { Box, Flex, IconButton, Tabs, TabList, Tab } from "@chakra-ui/react";
import CategoryFilter from "./CategoryFilter";
import HamburgerSVG from "../svg_components/HamburgerSVG";

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
  const headerVisible = isHeaderVisible !== "false";

  // feed type (tab) and article categories (filter pill) are combined in one request
  const [feedType, setFeedType] = useState("latest");
  const [categories, setCategories] = useState([]);
  // mobile: filters are folded behind the hamburger once the header scrolls away
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (headerVisible) setMenuOpen(false);
  }, [headerVisible]);

  const filtersShown = headerVisible || menuOpen;

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
        {/* logo (and hamburger on phones) once the page header has scrolled away */}
        {!headerVisible ? (
          <Flex
            flex={{ base: "1 1 100%", md: "0 0 auto" }}
            align="center"
            justify="space-between"
          >
            <Box
              as="button"
              type="button"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              fontFamily="KyivType Titling"
              fontSize={{ base: "2xl", md: "3xl" }}
              lineHeight="1"
              color="#FF3131"
              whiteSpace="nowrap"
            >
              early bird
            </Box>
            <IconButton
              display={{ base: "inline-flex", md: "none" }}
              aria-label={menuOpen ? "Close filters" : "Open filters"}
              aria-expanded={menuOpen}
              icon={<HamburgerSVG open={menuOpen} />}
              onClick={() => setMenuOpen(!menuOpen)}
              size="sm"
              variant="ghost"
              color="#303030"
              _hover={{ bg: "#E8E7C8" }}
            />
          </Flex>
        ) : null}

        <TabList
          display={{ base: filtersShown ? "flex" : "none", md: "flex" }}
          flex={{ base: "1 1 100%", md: "0 0 auto" }}
        >
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

        <CategoryFilter
          display={{ base: filtersShown ? "block" : "none", md: "block" }}
          value={categories}
          onChange={changeCategories}
        />
      </Flex>
    </Tabs>
  );
};

export default FilterBar;
