import React from 'react'
import styled from 'styled-components'
import { Button, Variant } from './Button'
import { Alert } from './Alert'
import { InputRow } from './InputRow'
import compactBreakpoint from '../constants/compactBreakpoint'

const Overlay = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;

    background-color: rgba(0, 0, 0, 0.5);
`

const Container = styled.div`
    width: 420px;
    max-width: 100%;
    max-height: calc(100% - var(--standard-margin));

    display: flex;
    flex-direction: column;
    align-self: center;

    border-radius: var(--standard-border-radius);
    box-shadow: 0 calc(var(--standard-margin) / 1) calc(var(--standard-margin) * 2) rgba(0, 0, 0, 0.4);

    @media (max-width: ${compactBreakpoint}px) {
        align-self: flex-end;
    }
`

const Header = styled.div`
    display: flex;
    align-items: center;

    padding: var(--standard-margin);

    background-color: var(--secondary-fill-color);
    border: var(--standard-border);
    border-radius: var(--standard-border-radius) var(--standard-border-radius) 0 0;

    @media (max-width: ${compactBreakpoint}px) {
        border-left: none;
        border-right: none;
    }
`

const Title = styled.div`
    font-size: 24px;
    font-weight: 500;
`

const Spacer = styled.div`
    flex-grow: 1;
`

const Content = styled.div`
    padding: calc(var(--standard-margin) / 2);

    border-left: var(--standard-border);
    border-right: var(--standard-border);

    background-color: var(--primary-fill-color);

    overflow: auto;

    ${Alert}, ${InputRow} {
        padding: calc(var(--standard-margin) / 2);
    }

    @media (max-width: ${compactBreakpoint}px) {
        border: none;
    }
`

const Footer = styled.div`
    padding: calc(var(--standard-margin) / 2);

    ${Button} {
        margin: calc(var(--standard-margin) / 2);
    }

    background-color: var(--secondary-fill-color);
    border: var(--standard-border);
    border-radius: 0 0 var(--standard-border-radius) var(--standard-border-radius);

    @media (max-width: ${compactBreakpoint}px) {
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-bottom: none;
    }
`

type Props = {
    title: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
    onClose: () => void;
}

export const PopupDialog = ({ title, children, footer, onClose }: Props) => (
    <Overlay>
        <Container>
            <Header>
                <Title>{title}</Title>
                <Spacer />
                <Button variant={Variant.Secondary} onClick={onClose}>
                    <i className="fas fa-fw fa-times" />
                </Button>
            </Header>
            <Content>{children}</Content>
            <Footer>{footer}</Footer>
        </Container>
    </Overlay>
)
