import { useBoolean } from '@literal-ui/hooks'
import React, { Fragment } from 'react'
import { useMemo } from 'react'
import { useSnapshot } from 'valtio'

import { Annotation } from '@ink/reader/annotation'
import { group, keys } from '@ink/reader/utils'

import { reader } from '../Reader'
import { Row } from '../Row'
import { PaneViewProps, PaneView, Pane } from '../base'

export const AnnotationView: React.FC<PaneViewProps> = (props) => {
  return (
    <PaneView {...props}>
      <DefinitionPane />
      <AnnotationPane />
    </PaneView>
  )
}

export const DefinitionPane: React.FC = () => {
  const { focusedBookTab } = useSnapshot(reader)

  return (
    <Pane headline="Definitions" preferredSize={120}>
      {focusedBookTab?.book.definitions.map((d) => {
        return (
          <Row
            key={d}
            onDelete={() => {
              reader.focusedBookTab?.undefine(d)
            }}
          >
            {d}
          </Row>
        )
      })}
    </Pane>
  )
}

const AnnotationPane: React.FC = () => {
  const { focusedBookTab } = useSnapshot(reader)
  const groupedAnnotation = useMemo(() => {
    return group(
      (focusedBookTab?.book.annotations as Annotation[]) ?? [],
      (a) => a.spine.index,
    )
  }, [focusedBookTab?.book.annotations])

  return (
    <Pane headline="Annotations">
      {keys(groupedAnnotation).map((k) => (
        <AnnotationBlock key={k} annotations={groupedAnnotation[k]!} />
      ))}
    </Pane>
  )
}

interface AnnotationBlockProps {
  annotations: Annotation[]
}
const AnnotationBlock: React.FC<AnnotationBlockProps> = ({ annotations }) => {
  const [expanded, toggle] = useBoolean(true)

  return (
    <div>
      <Row
        depth={1}
        badge
        expanded={expanded}
        toggle={toggle}
        subitems={annotations}
      >
        {annotations[0]?.spine.title}
      </Row>

      {expanded && (
        <div>
          {annotations.map((a) => (
            <Fragment key={a.id}>
              <Row
                depth={2}
                onClick={() => {
                  reader.focusedBookTab?.display(a.cfi)
                }}
                onDelete={() => {
                  reader.focusedBookTab?.removeAnnotation(a.cfi)
                }}
              >
                {a.text}
              </Row>
              {a.notes && (
                <Row
                  depth={3}
                  onClick={() => {
                    reader.focusedBookTab?.display(a.cfi)
                  }}
                >
                  <span className="text-outline">{a.notes}</span>
                </Row>
              )}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
