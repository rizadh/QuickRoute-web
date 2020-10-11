import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Alert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Checkbox } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Body, Footer } from '../Editor'
import { PageSizes, PDFDocument, range, StandardFonts } from 'pdf-lib'
import { useSelector } from 'react-redux'
import { AppState } from '../../../redux/state'
import { saveAs } from 'file-saver'

export const ExportPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const [orderByAddress, setOrderByAddress] = useState(false)
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setOrderByAddress(e.currentTarget.checked)
    }, [])

    const downloadPdf = useCallback(async () => {
        const document = await PDFDocument.create()
        const font = await document.embedFont(StandardFonts.HelveticaBold)
        const pages = range(0, Math.ceil(waypoints.length / 50)).map(() =>
            document.addPage([PageSizes.Letter[1], PageSizes.Letter[0]]),
        )

        const FONT_SIZE = 16
        const PAGE_MARGIN = 15
        const LIST_INDENT = 40
        const COLUMNS_PER_PAGE = 2
        const ROWS_PER_PAGE = 25
        const WAYPOINTS_PER_PAGE = ROWS_PER_PAGE * COLUMNS_PER_PAGE

        const indexedWaypoints = waypoints.map((waypoint, index) => ({ waypoint, index }))
        if (orderByAddress) indexedWaypoints.sort((a, b) => a.waypoint.address.localeCompare(b.waypoint.address))

        indexedWaypoints.forEach(({ waypoint, index: originalIndex }, index) => {
            const page = pages[Math.floor(index / WAYPOINTS_PER_PAGE)]

            const rowIndex = index % ROWS_PER_PAGE
            const columnIndex = Math.floor((index / ROWS_PER_PAGE) % COLUMNS_PER_PAGE)

            const { height: pageHeight, width: pageWidth } = page.getSize()

            const effectivePageHeight = pageHeight - 2 * PAGE_MARGIN
            const rowHeight = effectivePageHeight / ROWS_PER_PAGE
            const rowPosition = pageHeight - PAGE_MARGIN - (rowIndex + 1) * rowHeight

            const effectivePageWidth = pageWidth - 2 * PAGE_MARGIN
            const columnWidth = effectivePageWidth / COLUMNS_PER_PAGE
            const columnPosition = PAGE_MARGIN + columnIndex * columnWidth

            page.drawText(`${originalIndex + 1}.`, { x: columnPosition, y: rowPosition, size: FONT_SIZE, font })
            page.drawText(waypoint.address, { x: columnPosition + LIST_INDENT, y: rowPosition, size: FONT_SIZE, font })
        })

        saveAs(new Blob([await document.save()]), `waypoints-${Date.now()}.pdf`)
    }, [waypoints, orderByAddress])

    return (
        <>
            <Body>
                <InputRow>
                    <Alert>List addresses in alphabetical order</Alert>
                    <Spacer />
                    <Checkbox type="checkbox" checked={orderByAddress} onChange={handleChange}></Checkbox>
                </InputRow>
            </Body>
            <Footer>
                <Button variant={Variant.Primary} onClick={downloadPdf}>
                    <i className="fas fa-fw fa-file-download" /> Download
                </Button>
            </Footer>
        </>
    )
}

const Spacer = styled.div`
    flex-grow: 1;
`
