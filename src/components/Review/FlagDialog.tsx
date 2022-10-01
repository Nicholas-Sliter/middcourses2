import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    useDisclosure,
    Input,
    Textarea
} from "@chakra-ui/react";
import React from 'react';
import TextInput from '../common/TextInput';
import ReviewContentInput from '../common/ReviewContentInput';
import { CustomSession, public_review } from '../../lib/common/types';
import styles from './FlagDialog.module.scss';
import { useSession } from 'next-auth/react';
import { useToast } from '@chakra-ui/react';

interface FlagDialogProps {
    review: public_review;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}



function FlagDialog({ review, isOpen, setOpen }: FlagDialogProps) {
    const { register, handleSubmit, control } = useForm();
    const cancelRef = React.useRef()
    const { data: session } = useSession() as { data: CustomSession };
    const loggedIn = session?.user ?? false;
    const toast = useToast();

    useEffect(() => {
        if (!loggedIn && isOpen) {
            toast({
                title: "You must be logged in to flag a review.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setOpen(false);
            return null;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn, isOpen]);

    const onSubmit = (data) => {
        console.log(data);
        handleSubmit(data);

    }

    if (!isOpen) {
        return null;
    }

    return (
        <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={() => { }} >
            <AlertDialogOverlay className={styles.container}>
                <AlertDialogContent className={styles.content}>
                    <AlertDialogHeader>Flag Review</AlertDialogHeader>
                    <AlertDialogBody className={styles.body}>
                        <Textarea
                            name="Report reason"
                            placeholder="Please describe why this review should be removed."
                            {...register("reason")}
                            resize="none"
                        />

                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            colorScheme="grey"
                            textColor={"black"}
                            onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            colorScheme="red"
                            onClick={onSubmit}>Flag</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog >
    );




}


export default FlagDialog;


