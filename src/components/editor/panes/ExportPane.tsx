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

const DEFAULT_COLUMNS_PER_PAGE = 2
const DEFAULT_ROWS_PER_PAGE = 30

export const ExportPane = () => {
    const waypoints = useSelector((state: AppState) => state.waypoints)
    const [useLandscape, setUseLandscape] = useState(true)
    const [orderByAddress, setOrderByAddress] = useState(false)
    const handleOrderByAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setOrderByAddress(e.currentTarget.checked)
    }, [])
    const handleUseLandscapeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUseLandscape(e.currentTarget.checked)
    }, [])
    const rowsField = useInput({ predicate: value => value.length === 0 || !isNaN(parseInt(value)) })
    const columnsField = useInput({ predicate: value => value.length === 0 || !isNaN(parseInt(value)) })

    const fieldsAreValid = rowsField.valueIsValid && columnsField.valueIsValid

    const rowsPerPage = parseInt(rowsField.value, 10) || DEFAULT_ROWS_PER_PAGE
    const columnsPerPage = parseInt(columnsField.value, 10) || DEFAULT_COLUMNS_PER_PAGE

    const downloadPdf = useCallback(
        () =>
            generateAndDownloadPdf(
                waypoints.map(({ address }) => address),
                { rowsPerPage, columnsPerPage, orderByAddress, useLandscape },
            ),
        [waypoints, rowsPerPage, columnsPerPage, orderByAddress, useLandscape],
    )

    return (
        <>
            <Body>
                <InputRow>
                    <Alert>Columns per page</Alert>
                    <Spacer />
                    <FixedWidthInput placeholder={DEFAULT_COLUMNS_PER_PAGE.toString()} {...columnsField.props} />
                </InputRow>
                <InputRow>
                    <Alert>Rows per page</Alert>
                    <Spacer />
                    <FixedWidthInput placeholder={DEFAULT_ROWS_PER_PAGE.toString()} {...rowsField.props} />
                </InputRow>
                <InputRow>
                    <Alert>Layout in landscape</Alert>
                    <Spacer />
                    <Checkbox type="checkbox" checked={useLandscape} onChange={handleUseLandscapeChange}></Checkbox>
                </InputRow>
                <InputRow>
                    <Alert>Organize by house number</Alert>
                    <Spacer />
                    <Checkbox type="checkbox" checked={orderByAddress} onChange={handleOrderByAddressChange}></Checkbox>
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
    useLandscape: boolean
    columnsPerPage: number
    rowsPerPage: number
    orderByAddress: boolean
}

async function generateAndDownloadPdf(
    addresses: string[],
    { rowsPerPage, columnsPerPage, orderByAddress, useLandscape }: GeneratePdfOptions,
) {
    // Document and font setup
    const document = await PDFDocument.create()
    const font = await document.embedFont(StandardFonts.HelveticaBold)
    const preferredfontSize = (useLandscape ? 500 : 700) / rowsPerPage

    // Page creation
    const [pageWidth, pageHeight] = useLandscape ? [...PageSizes.Letter].reverse() : PageSizes.Letter
    const addressesPerPage = rowsPerPage * columnsPerPage
    const numPages = Math.ceil(addresses.length / addressesPerPage)
    const pages = range(0, numPages).map(() => document.addPage([pageWidth, pageHeight]))

    // Vertical positioning
    const rowHeight = (pageHeight - 2 * PAGE_MARGIN) / rowsPerPage
    const textHeight = font.heightAtSize(preferredfontSize)
    const baselineOffset = (rowHeight - textHeight) / 1.5

    // Horizontal positioning
    const columnWidth = (pageWidth - (1 + columnsPerPage) * PAGE_MARGIN) / columnsPerPage
    const maxDigits = Math.floor(Math.log10(addresses.length)) + 1
    const indexTextPlaceholder =
        range(0, maxDigits)
            .map(() => '0')
            .join('') + '.'
    const indexTextWidth = font.widthOfTextAtSize(indexTextPlaceholder, preferredfontSize)
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
        const page = pages[Math.floor(index / addressesPerPage)]

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
        if (orderByAddress && previousFirstCharacter && previousFirstCharacter !== address[0]) {
            const thickness = preferredfontSize / 8
            page.drawLine({
                start: { x: columnPosition, y: rowPosition + rowHeight - thickness / 2 },
                end: { x: columnPosition + columnWidth, y: rowPosition + rowHeight - thickness / 2 },
                thickness,
                lineCap: LineCapStyle.Round,
            })
        }

        previousFirstCharacter = address[0]
    })

    const dateString = new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
    saveAs(new Blob([await document.save()]), `Route - ${dateString}.pdf`)
}
