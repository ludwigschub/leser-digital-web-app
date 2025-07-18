import React, { useCallback, useEffect, useMemo, useState } from "react"

import { Flex, Header, Tabs, Typography } from "@sampled-ui/base"
import { useInView } from "react-intersection-observer"
import { useLocation, useNavigate } from "react-router"

import {
  ArticleFeedFragment,
  useFeedLazyQuery,
  useLoggedInQuery,
} from "../../../../generated/graphql"
import ArticleFeed from "../../components/Article/ArticleFeed"
import LoadingArticleFeed from "../../components/Article/LoadingArticleFeed"

export const HomePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)
  const [selectedTab, setSelectedTab] = useState(params.get("tab") || "all")

  const { data: loggedInQueryData } = useLoggedInQuery()
  const [
    feedQuery,
    { data: feedQueryData, loading: loadingArticles, fetchMore },
  ] = useFeedLazyQuery()
  const queryVariables = useMemo(() => {
    return {
      filter: {
        short:
          selectedTab === "breaking"
            ? true
            : selectedTab === "articles"
            ? false
            : undefined,
      },
    }
  }, [selectedTab])
  useEffect(() => {
    if (loggedInQueryData?.loggedIn) {
      feedQuery({
        variables: { ...queryVariables, pagination: { offset: 0, limit: 10 } },
        fetchPolicy: "network-only",
      })
    } else {
      feedQuery({
        variables: { ...queryVariables, pagination: { offset: 0, limit: 10 } },
      })
    }
  }, [feedQuery, loggedInQueryData, queryVariables, selectedTab])

  const [hasMore, setHasMore] = useState(true)
  const loadMore = useCallback(() => {
    if (hasMore && !loadingArticles) {
      fetchMore({
        variables: {
          ...queryVariables,
          pagination: {
            offset: feedQueryData?.feed?.length,
            limit: 10,
          },
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if ((fetchMoreResult.feed?.length ?? 0) < 10) {
            setHasMore(false)
          }
          if (
            prev.feed &&
            fetchMoreResult.feed &&
            (fetchMoreResult.feed?.length ?? 0) > 0
          ) {
            return Object.assign({}, prev, {
              feed: [
                ...prev.feed,
                ...fetchMoreResult.feed,
              ] as ArticleFeedFragment[],
            })
          }
          return prev
        },
      })
    }
  }, [
    feedQueryData?.feed?.length,
    fetchMore,
    hasMore,
    loadingArticles,
    queryVariables,
  ])

  const { ref, inView } = useInView()
  useEffect(() => {
    if (inView && hasMore) {
      loadMore()
    }
  }, [hasMore, inView, loadMore])

  const empty = useMemo(() => {
    if (
      (!feedQueryData?.feed || feedQueryData.feed.length === 0) &&
      !loadingArticles
    ) {
      return (
        <Typography.Text disabled bold style={{ textAlign: "center" }}>
          Keine Artikel gefunden
        </Typography.Text>
      )
    } else {
      return null
    }
  }, [feedQueryData?.feed, loadingArticles])

  const loading = useMemo(() => {
    if (loadingArticles) {
      return <LoadingArticleFeed />
    } else {
      return null
    }
  }, [loadingArticles])

  const feed = useMemo(() => {
    if (feedQueryData?.feed?.length) {
      return <ArticleFeed articles={feedQueryData.feed} lastRef={ref} />
    } else {
      return null
    }
  }, [feedQueryData?.feed, ref])

  return (
    <div>
      <Header>
        <Tabs
          onSelect={(item) => {
            navigate(`?tab=${item.key}`)
            setSelectedTab(item.key)
          }}
          selected={selectedTab}
          items={[
            { title: "Alles", key: "all" },
            { title: "Artikel", key: "articles" },
            { title: "Kurzmeldungen", key: "breaking" },
          ]}
          style={{ margin: "1rem 0.5rem" }}
        />
      </Header>
      <title>Startseite</title>
      <Flex
        direction="column"
        align="stretch"
        style={{ width: "100%", paddingBottom: "6rem" }}
      >
        {empty}
        {loading}
        {feed}
        {!hasMore ? (
          <Typography.Text disabled bold style={{ textAlign: "center" }}>
            Keine weiteren Artikel verfügbar.
          </Typography.Text>
        ) : null}
      </Flex>
    </div>
  )
}
