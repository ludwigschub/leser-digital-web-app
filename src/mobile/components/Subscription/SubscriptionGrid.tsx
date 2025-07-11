import React, { useMemo } from "react"

import { Column, Flex, Row } from "@sampled-ui/base"

import {
  SourceGridFragment,
  TopicGridFragment,
  UserSubscriptionFragment,
} from "../../../../generated/graphql"
import { SubscriptionItem } from "../../../shared/components"

interface SubscriptionGridItem {
  source: SourceGridFragment | TopicGridFragment
  subscription?: UserSubscriptionFragment
}

interface SubscriptionGridProps {
  userSubscriptions?: UserSubscriptionFragment[] | null
  sources: (SourceGridFragment | TopicGridFragment)[] | null
}

const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  sources,
  userSubscriptions,
}) => {
  const gridRows = useMemo(() => {
    return sources?.reduce((allRows, _currentSource, index, allSources) => {
      const row = []
      const columns = 2
      for (let i = 0; i < columns; i++) {
        if (allSources[index + i]) {
          row.push({
            source: allSources[index + i],
            subscription: userSubscriptions?.find((s) => {
              return (
                s.searchTerm.source?.id === allSources[index + i].id ||
                s.searchTerm.topic?.id === allSources[index + i].id
              )
            }) as UserSubscriptionFragment | undefined,
          })
        }
      }
      if (
        index === 0 ||
        index % columns === 0 ||
        allSources[index] === undefined
      ) {
        return [...allRows, row]
      }
      return allRows
    }, [] as SubscriptionGridItem[][])
  }, [sources, userSubscriptions])

  return (
    <Flex direction="column" style={{ width: "100%" }}>
      {gridRows?.map((row, index) => {
        return (
          <Row key={`row-${index}`} style={{ height: "12rem", marginBottom: "0.0625rem" }} gap="0.0625rem">
            {row.map((source, i) => {
              return (
                <Column
                  key={`column-${i}`}
                  span={12}
                  style={{ height: "100%" }}
                >
                  <SubscriptionItem
                    source={source.source}
                    userSubscription={source.subscription}
                  />
                </Column>
              )
            })}
          </Row>
        )
      })}
    </Flex>
  )
}

export default SubscriptionGrid
