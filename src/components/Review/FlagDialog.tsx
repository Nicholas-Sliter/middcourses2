import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
    Textarea,
    Select,
    Spacer,
    Box
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

    const onSubmit = async (data) => {
        console.log(data);

        const body = {
            reviewID: review.reviewID,
            reason: data.reasonOther || data.reason,
        }

        if (body.reason === "") {
            toast({
                title: "Please specify a reason.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const res = await fetch(`/api/reviews/${review.reviewID}/flag`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            toast({
                title: "Review flagged.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setOpen(false);
        }
        else {
            toast({
                title: "Error flagging review.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }


    }


    const selectReason = useWatch({
        control,
        name: "reason",
        defaultValue: "Select a reason"
    });


    if (!isOpen) {
        return null;
    }

    return (
        <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={() => { }} >
            <AlertDialogOverlay className={styles.container}>
                <AlertDialogContent className={styles.content}>
                    <AlertDialogHeader>Flag Review</AlertDialogHeader>
                    <AlertDialogBody className={styles.body}>
                        <form onSubmit={handleSubmit(onSubmit)}>

                            <Select
                                style={{ marginBottom: "1rem" }}
                                name="reason"
                                {...register("reason")}
                                placeholder="Select a reason for flagging this review"
                            >
                                {[
                                    "This review contains hateful or obscene language.",
                                    "This review threatens or encourages violence.",
                                    "This review is spam or is otherwise inappropriate.",
                                    "This review is a duplicate of another review.",
                                    "This review is not related to this course or instructor.",
                                    "This review is low quality.",
                                    'Other, please specify'

                                ].map((reason) => {
                                    return (
                                        <option key={reason} value={reason}>{reason}</option>)
                                }
                                )}


                            </Select>

                            {(selectReason === "Other, please specify") ? (<Textarea
                                name="Report reason"
                                placeholder="Please describe why this review should be removed."
                                {...register("reasonOther")}
                                resize="none"
                            />) : null}


                        </form>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            colorScheme="grey"
                            textColor={"black"}
                            onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            colorScheme="red"
                            onClick={handleSubmit(onSubmit)}>Flag</Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog >
    );




}


export default FlagDialog;


