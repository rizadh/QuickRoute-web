import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Alert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Checkbox, Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Body, Footer } from '../Editor'
import { PageSizes, PDFDocument, range, StandardFonts } from 'pdf-lib'
import { useSelector } from 'react-redux'
import { AppState } from '../../../redux/state'
import { saveAs } from 'file-saver'
import { useInput } from '../../../hooks/useInput'

const DEFAULT_ROWS_PER_PAGE = 20
const DEFAULT_COLUMNS_PER_PAGE = 2
const DEFAULT_FONT_SIZE = 18

export const ExportPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const [orderByAddress, setOrderByAddress] = useState(false)
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setOrderByAddress(e.currentTarget.checked)
    }, [])
    const { value: rowsFieldValue, props: rowsFieldProps, valueIsValid: rowsIsValid } = useInput({
        predicate: value => value.length === 0 || !isNaN(parseInt(value)),
    })
    const { value: columnsFieldValue, props: columnsFieldProps, valueIsValid: columnsIsValid } = useInput({
        predicate: value => value.length === 0 || !isNaN(parseInt(value)),
    })
    const { value: fontSizeFieldValue, props: fontSizeFieldProps, valueIsValid: fontSizeIsValid } = useInput({
        predicate: value => value.length === 0 || !isNaN(parseInt(value)),
    })

    const canDownload = rowsIsValid && columnsIsValid && fontSizeIsValid

    const downloadPdf = useCallback(async () => {
        const PAGE_MARGIN = 72 / 4
        const LIST_INDENT = 72 / 2

        const rowsPerPage = parseInt(rowsFieldValue) || DEFAULT_ROWS_PER_PAGE
        const columnsPerPage = parseInt(columnsFieldValue) || DEFAULT_COLUMNS_PER_PAGE
        const fontSize = parseInt(fontSizeFieldValue) || DEFAULT_FONT_SIZE
        const waypointsPerPage = rowsPerPage * columnsPerPage

        const document = await PDFDocument.create()
        const font = await document.embedFont(StandardFonts.HelveticaBold)
        const pages = range(0, Math.ceil(waypoints.length / waypointsPerPage)).map(() =>
            document.addPage([PageSizes.Letter[1], PageSizes.Letter[0]]),
        )

        const indexedWaypoints = waypoints.map((waypoint, index) => ({ waypoint, index }))
        if (orderByAddress) indexedWaypoints.sort((a, b) => a.waypoint.address.localeCompare(b.waypoint.address))

        indexedWaypoints.forEach(({ waypoint, index: originalIndex }, index) => {
            const page = pages[Math.floor(index / waypointsPerPage)]

            const rowIndex = index % rowsPerPage
            const columnIndex = Math.floor((index / rowsPerPage) % columnsPerPage)

            const { height: pageHeight, width: pageWidth } = page.getSize()

            const effectivePageHeight = pageHeight - 2 * PAGE_MARGIN
            const rowHeight = effectivePageHeight / rowsPerPage
            const rowPosition = pageHeight - PAGE_MARGIN - (rowIndex + 1) * rowHeight

            const effectivePageWidth = pageWidth - 2 * PAGE_MARGIN
            const columnWidth = effectivePageWidth / columnsPerPage
            const columnPosition = PAGE_MARGIN + columnIndex * columnWidth

            page.drawText(`${originalIndex + 1}.`, { x: columnPosition, y: rowPosition, size: fontSize, font })
            page.drawText(waypoint.address, { x: columnPosition + LIST_INDENT, y: rowPosition, size: fontSize, font })
        })

        const dateString = new Date().toISOString().split('T')[0].replace(/-/g, '')
        saveAs(new Blob([await document.save()]), `waypoints-${dateString}.pdf`)
    }, [waypoints, orderByAddress, rowsFieldValue, columnsFieldValue, fontSizeFieldValue])

    return (
        <>
            <Body>
                <InputRow>
                    <Alert>Rows per page</Alert>
                    <Spacer />
                    <FixedWidthInput placeholder={DEFAULT_ROWS_PER_PAGE.toString()} {...rowsFieldProps} />
                </InputRow>
                <InputRow>
                    <Alert>Columns per page</Alert>
                    <Spacer />
                    <FixedWidthInput placeholder={DEFAULT_COLUMNS_PER_PAGE.toString()} {...columnsFieldProps} />
                </InputRow>
                <InputRow>
                    <Alert>Font size</Alert>
                    <Spacer />
                    <FixedWidthInput placeholder={DEFAULT_FONT_SIZE.toString()} {...fontSizeFieldProps} />
                </InputRow>
                <InputRow>
                    <Alert>List addresses in alphabetical order</Alert>
                    <Spacer />
                    <Checkbox type="checkbox" checked={orderByAddress} onChange={handleChange}></Checkbox>
                </InputRow>
            </Body>
            <Footer>
                <Button variant={Variant.Primary} onClick={downloadPdf} disabled={!canDownload}>
                    <i className="fas fa-fw fa-file-download" /> Download
                </Button>
            </Footer>
        </>
    )
}

const Spacer = styled.div`
    flex-grow: 1;
`

const FixedWidthInput = styled(Input)`
    max-width: 24px;
    line-height: 1px;
    text-align: right;
`
