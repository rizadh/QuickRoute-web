import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Alert } from '../../common/Alert'
import { Button, Variant } from '../../common/Button'
import { Checkbox, Input } from '../../common/Input'
import { InputRow } from '../../common/InputRow'
import { Body, Footer } from '../Editor'
import { LineCapStyle, PageSizes, PDFDocument, range, StandardFonts } from 'pdf-lib'
import { useSelector } from 'react-redux'
import { AppState } from '../../../redux/state'
import { saveAs } from 'file-saver'
import { useInput } from '../../../hooks/useInput'

const DEFAULT_ROWS_PER_PAGE = 40
const DEFAULT_COLUMNS_PER_PAGE = 2
const DEFAULT_FONT_SIZE = 14

export const ExportPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const [useLandscape, setUseLandscape] = useState(false)
    const [orderByAddress, setOrderByAddress] = useState(false)
    const [drawDividers, setDrawDividers] = useState(false)
    const handleOrderByAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setOrderByAddress(e.currentTarget.checked)
        // if (!e.currentTarget.checked) setDrawDividers(false)
    }, [])
    const handleUseLandscapeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUseLandscape(e.currentTarget.checked)
    }, [])
    const handleDrawDividersChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDrawDividers(e.currentTarget.checked)
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

    const fieldsAreValid = rowsIsValid && columnsIsValid && fontSizeIsValid

    const downloadPdf = useCallback(
        () =>
            generateAndDownloadPdf(
                waypoints.map(({ address }) => address),
                {
                    rowsPerPage: parseInt(rowsFieldValue, 10) || DEFAULT_ROWS_PER_PAGE,
                    columnsPerPage: parseInt(columnsFieldValue, 10) || DEFAULT_COLUMNS_PER_PAGE,
                    preferredfontSize: parseInt(fontSizeFieldValue, 10) || DEFAULT_FONT_SIZE,
                    orderByAddress,
                    useLandscape,
                    drawDividers,
                },
            ),
        [waypoints, rowsFieldValue, columnsFieldValue, fontSizeFieldValue, orderByAddress, useLandscape, drawDividers],
    )

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
                    <Alert>Use landscape orientation</Alert>
                    <Spacer />
                    <Checkbox type="checkbox" checked={useLandscape} onChange={handleUseLandscapeChange}></Checkbox>
                </InputRow>
                <InputRow>
                    <Alert>Sort by house number</Alert>
                    <Spacer />
                    <Checkbox type="checkbox" checked={orderByAddress} onChange={handleOrderByAddressChange}></Checkbox>
                </InputRow>
                <InputRow>
                    <Alert>Draw dividers</Alert>
                    <Spacer />
                    <Checkbox
                        type="checkbox"
                        checked={drawDividers}
                        disabled={!orderByAddress}
                        onChange={handleDrawDividersChange}
                    ></Checkbox>
                </InputRow>
            </Body>
            <Footer>
                <Button variant={Variant.Primary} onClick={downloadPdf} disabled={!fieldsAreValid}>
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

const PAGE_MARGIN = 72 / 4

type GeneratePdfOptions = {
    rowsPerPage: number
    columnsPerPage: number
    preferredfontSize: number
    orderByAddress: boolean
    useLandscape: boolean
    drawDividers: boolean
}

async function generateAndDownloadPdf(
    addresses: string[],
    { rowsPerPage, columnsPerPage, preferredfontSize, orderByAddress, useLandscape, drawDividers }: GeneratePdfOptions,
) {
    // Document and font setup
    const document = await PDFDocument.create()
    const font = await document.embedFont(StandardFonts.HelveticaBold)

    // Page creation
    const [pageWidth, pageHeight] = useLandscape ? [...PageSizes.Letter].reverse() : PageSizes.Letter
    const waypointsPerPage = rowsPerPage * columnsPerPage
    const numPages = Math.ceil(addresses.length / waypointsPerPage)
    const pages = range(0, numPages).map(() => document.addPage([pageWidth, pageHeight]))

    // Vertical positioning
    const rowHeight = (pageHeight - 2 * PAGE_MARGIN) / rowsPerPage
    const textHeight = font.heightAtSize(preferredfontSize)
    const baselineOffset = (rowHeight - textHeight) / 1.5

    // Horizontal positioning
    const columnWidth = (pageWidth - (1 + columnsPerPage) * PAGE_MARGIN) / columnsPerPage
    const indexTextWidth = font.widthOfTextAtSize('00.', preferredfontSize)
    const addressIndent = indexTextWidth + textHeight / 2
    const availableAddressWidth = columnWidth - addressIndent

    // Address sorting
    const indexedAddresses = addresses.map((address, index) => ({ address, index }))
    if (orderByAddress) indexedAddresses.sort((a, b) => a.address.localeCompare(b.address))

    // Draw loop
    let previousFirstCharacter: string
    indexedAddresses.forEach(({ address, index: originalIndex }, index) => {
        // Row position
        const rowIndex = index % rowsPerPage
        const rowPosition = pageHeight - PAGE_MARGIN - (rowIndex + 1) * rowHeight

        // Column position
        const columnIndex = Math.floor(index / rowsPerPage) % columnsPerPage
        const columnPosition = PAGE_MARGIN + columnIndex * (columnWidth + PAGE_MARGIN)

        // Shrink address to fit
        const fullsizeAddressWidth = font.widthOfTextAtSize(address, preferredfontSize)
        const fontScaleFactor = Math.min(availableAddressWidth / fullsizeAddressWidth, 1)

        // Get current page
        const page = pages[Math.floor(index / waypointsPerPage)]

        // Draw index
        page.drawText(`${originalIndex + 1}.`, {
            x: columnPosition,
            y: rowPosition + baselineOffset,
            size: preferredfontSize,
            font,
        })

        // Draw address
        page.drawText(address, {
            x: columnPosition + addressIndent,
            y: rowPosition + baselineOffset,
            size: preferredfontSize * fontScaleFactor,
            font,
        })

        // Draw divider above address if previous first character was different
        if (orderByAddress && drawDividers && previousFirstCharacter && previousFirstCharacter !== address[0]) {
            page.drawLine({
                start: { x: columnPosition, y: rowPosition + rowHeight },
                end: { x: columnPosition + columnWidth, y: rowPosition + rowHeight },
                thickness: preferredfontSize / 9,
                lineCap: LineCapStyle.Round,
            })
        }

        previousFirstCharacter = address[0]
    })

    const dateString = new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
    saveAs(new Blob([await document.save()]), `Route - ${dateString}.pdf`)
}
