import React, { useState, useEffect, useRef } from "react";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
  EventChangeArg,
  formatDate,
  EventInput,
} from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "@/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Button } from "../ui/button";
const adminArray = [
  "KSca1U09jwMSIK0qYedXZDhe7d02",
  "6ok0udZR89QleRS7nlDC8jcNHFs2",
];

const Calendar: React.FC = () => {
  const [weekendsVisible, setWeekendsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hour24, setHour24] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const [currentEvents, setCurrentEvents] = useState<EventInput[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([]);

  const calendarComponentRef = useRef<FullCalendar | null>(null);

  const [search, setSearch] = useState<string>("");
  const [modalStartDate, setModalStartDate] = useState<string>("");
  const [modalEndDate, setModalEndDate] = useState<string>("");
  const [modalEventTitle, setModalEventTitle] = useState("");

  const [modalColor, setModalColor] = useState("black");
  const [eventToDelete, setEventToDelete] = useState<EventInput | null>();

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        adminArray.includes(user.uid) && setIsAdmin(true);
      } else {
        setUser(null);
      }
    });
  }, []);

  useEffect(() => {
    const eventsCollection = collection(db, "events");

    const unsubscribe = onSnapshot(eventsCollection, function (querySnapshot) {
      const eventsData: EventInput[] = [];

      querySnapshot.forEach(function (doc) {
        const event = doc.data() as any;
        let start = "";
        let end = "";
        let color = "";

        if (event.start) {
          if (typeof event.start === "string") {
            start = new Date(event.start).toISOString();
          } else if (event.start instanceof Date) {
            start = event.start.toISOString();
          }
        }

        if (event.end) {
          if (typeof event.end === "string") {
            end = new Date(event.end).toISOString();
          } else if (event.end instanceof Date) {
            end = event.end.toISOString();
          }
        }

        eventsData.push({
          id: doc.id,
          title: event.title,
          start: start,
          end: end,
          color: event.color,
          userDisplayName: event.userDisplayName,
        });
        console.log(eventsData);
      });

      setCurrentEvents(eventsData);
      updateFilteredEvents(search, eventsData);
    });

    return function cleanup() {
      unsubscribe();
    };
  }, [db]);

  const addEventToFirebase = async function (event: EventInput) {
    if (isAddingEvent) {
      return;
    }

    setIsAddingEvent(true);
    event.color = modalColor;
    setCurrentEvents(function (prevEvents) {
      return [...prevEvents, event];
    });

    try {
      const eventsCollection = collection(db, "events");
      const eventRef = await addDoc(eventsCollection, event);

      event.id = eventRef.id;
    } catch (error) {
      console.error("Error adding event to Firestore:", error);

      setCurrentEvents(function (prevEvents) {
        return prevEvents.filter(function (e) {
          return e.id !== event.id;
        });
      });
    } finally {
      setIsAddingEvent(false);
    }
  };

  const updateEventInFirebase = async function (event: EventInput) {
    try {
      if (!event.userDisplayName) {
        console.error("userDisplayName is undefined");
        return;
      }

      event.color = modalColor;
      console.log(event.color);
      const eventsCollection = collection(db, "events");
      const eventDoc = doc(eventsCollection, event.id);
      await updateDoc(eventDoc, {
        title: event.title,
        start: event.start,
        end: event.end,
        color: event.color,
        userDisplayName: event.userDisplayName,
      });

      setCurrentEvents(function (prevEvents) {
        return prevEvents.map(function (e) {
          return e.id === event.id ? event : e;
        });
      });
    } catch (error) {
      console.error("Error updating event in Firestore:", error);
    }
  };

  const removeEventFromFirebase = async function (event: EventInput) {
    const eventsCollection = collection(db, "events");
    const eventDoc = doc(eventsCollection, event.id);
    await deleteDoc(eventDoc);

    setCurrentEvents(function (prevEvents) {
      return prevEvents.filter(function (e) {
        return e.id !== event.id;
      });
    });
  };

  const handleDateSelect = function (selectInfo: DateSelectArg) {
    setModalEventTitle("");
    setModalStartDate(selectInfo.startStr);
    setModalEndDate(selectInfo.endStr);
    setIsModalOpen(true);
  };

  const handleModalSave = function () {
    if (modalEventTitle) {
      const newEvent: EventInput = {
        title: modalEventTitle,
        start: modalStartDate,
        end: modalEndDate,
        color: modalColor,
        allDay: true,
      };

      if (calendarComponentRef.current) {
        calendarComponentRef.current.getApi().unselect();
      }

      addEventToFirebase(newEvent);
      setIsModalOpen(false);
    }
  };

  const handleModalClose = function () {
    setIsModalOpen(false);
    if (calendarComponentRef.current) {
      calendarComponentRef.current.getApi().unselect();
    }
  };

  const handleEventClick = function (clickInfo: EventClickArg) {
    setEventToDelete(clickInfo.event.toPlainObject() as EventInput);
    setIsDeleteModalOpen(true);
  };

  const handleEventChange = async function (eventChangeInfo: EventChangeArg) {
    const updatedEvent = eventChangeInfo.event.toPlainObject() as EventInput;

    await updateEventInFirebase(updatedEvent);

    setCurrentEvents(function (prevEvents) {
      return prevEvents.map(function (e) {
        return e.id === updatedEvent.id ? updatedEvent : e;
      });
    });
  };

  const handleDeleteModalClose = function () {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteEvent = async function () {
    if (eventToDelete) {
      setIsDeleteModalOpen(false);
      await removeEventFromFirebase(eventToDelete);
    }
  };

  const handleWeekendsToggle = function () {
    setWeekendsVisible(!weekendsVisible);
  };

  const handleSearchChange = function (e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    updateFilteredEvents(e.target.value, currentEvents);
  };

  const updateFilteredEvents = function (
    searchValue: string,
    eventsData: EventInput[]
  ) {
    const lowerSearch = searchValue.toLowerCase();

    if (lowerSearch === "") {
      setFilteredEvents(eventsData);
    } else {
      const filtered = eventsData.filter(function (event) {
        const titleMatches =
          event.title && event.title.toLowerCase().includes(lowerSearch);

        return titleMatches;
      });

      setFilteredEvents(filtered);
    }
  };

  return (
    <div className="flex">
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white rounded-lg p-10 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="modal-content">
                <div className="modal-header flex justify-between items-center border-b pb-4 ">
                  <h3 className="modal-title text-3xl font-bold">
                    Create Event
                  </h3>
                  <button className="btn btn-clear" onClick={handleModalClose}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="modal-body mt-4">
                  <div className="form-control w-full max-w-xs">
                    <p className="text-2xl mb-2  font-semibold">Event Title</p>
                    <input
                      type="text"
                      placeholder="Type here"
                      className=" p-3 w-full max-w-xs"
                      value={modalEventTitle}
                      onChange={(e) => setModalEventTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-control w-full max-w-xs mt-4">
                    <label className="label">
                      <span className="label-text text-2xl font-semibold">
                        Event Color
                      </span>
                    </label>
                    <input
                      className="w-full h-16"
                      type="color"
                      value={modalColor}
                      onChange={(e) => setModalColor(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer mt-4 flex justify-end">
                  <Button className=" m-auto w-full" onClick={handleModalSave}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && eventToDelete && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden p-10 shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="modal-content">
                <div className="modal-header flex justify-between items-center border-b pb-4 ">
                  <h3 className="modal-title text-3xl font-bold">
                    Delete Event
                  </h3>
                  <button
                    className="btn btn-clear"
                    onClick={handleDeleteModalClose}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="modal-body mt-4">
                  <p className="text-xl">
                    Are you sure you want to delete the event &quot;
                    {eventToDelete.title}&quot;?
                  </p>
                </div>
                <div className="modal-footer mt-4 flex justify-end">
                  <Button className="m-auto w-full" onClick={handleDeleteEvent}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-1/4 bg-gray-200 hidden md:block p-4">
        <div className="mb-4">
          <div className="mb-4">
            <h1 className="text-3xl font-semibold mb-3 text-center">
              How to use:
            </h1>
            <ul className="text-md list-disc p-4">
              <li>
                You can toggle weekends visibility with the checkbox below.
              </li>
              <li>
                You can also switch between 12-hour and 24-hour time formats
                using the checkbox.
              </li>
            </ul>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={weekendsVisible}
              onChange={handleWeekendsToggle}
              className="form-checkbox"
            />
            <span className="text-sm">Toggle weekends</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              onChange={() => {
                setHour24(!hour24);
              }}
              className="form-checkbox"
            />
            <span className="text-sm">Toggle 12-hour format</span>
          </label>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">
            All Events ({currentEvents.length})
          </h2>
          <input
            type="text"
            placeholder="Filter by Event Name"
            value={search}
            onChange={handleSearchChange}
            className="w-full p-2 border rounded"
          />
          <ul className="mt-4 justify-center">
            {filteredEvents.length
              ? filteredEvents.map(renderSidebarEvent)
              : "No matching events"}
          </ul>
        </div>
      </div>
      <div className="w-full p-4">
        <FullCalendar
          ref={calendarComponentRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          timeZone="UTC"
          initialView="timeGridWeek"
          dayMaxEvents={true}
          weekends={weekendsVisible}
          events={currentEvents}
          select={handleDateSelect}
          eventContent={renderEventContent}
          unselectAuto={false}
          locale="bg"
          editable={isAdmin}
          selectable={isAdmin}
          selectMirror={isAdmin}
          eventClick={isAdmin ? handleEventClick : undefined}
          eventChange={isAdmin ? handleEventChange : undefined}
          slotLabelFormat={{
            hour: "numeric",
            minute: "numeric",
            hour12: hour24,
          }}
        />
      </div>
    </div>
  );

  function renderEventContent(eventContent: EventContentArg) {
    return (
      <>
        <i>
          {eventContent.event.title}
          {eventContent.event.extendedProps.userDisplayName}
        </i>
      </>
    );
  }

  function renderSidebarEvent(event: EventInput) {
    return (
      <li key={event.id} className="mb-2">
        <div className="flex items-center">
          <div className="w-2/5">
            <p className="font-semibold">
              {formatDate(event.start!, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="w-1/2 pl-1">
            <i>
              <span className="font-black">{event.title}</span>
              {event.userDisplayName}
            </i>
          </div>
        </div>
      </li>
    );
  }
};

export default Calendar;
