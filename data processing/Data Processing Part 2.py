import pandas as pd
import csv
import random
import numpy as np

#fig2_2_data processing
def network_output(filepath,name,activity_list,enroll_list):
    data = pd.read_csv(filepath)
    ID_list = []
    start_b,stop_b,start_min,stop_min = 0,0,240,0

    race_list = list(range(1,5))

    categories_list = [[x,y,z] for x in race_list for y in enroll_list for z in activity_list]
    count_by_period_list = [list(np.zeros(48)) for x in list(range(len(categories_list)))]

    time_period_list = ['b' + str(x) for x in list(range(48))]

    statistic_categories = pd.DataFrame(categories_list, columns = ['race','enroll','activity'])
    statistic_time_period = pd.DataFrame(count_by_period_list,columns= time_period_list)
    statistic_all = pd.concat([statistic_categories,statistic_time_period],axis = 1)

    # for index, row in data.loc[1:100,:].iterrows():
    for index, row in data.iterrows():
        scan_caseID = row['caseID']
        if len(ID_list) == 0:
            ID_list.append(scan_caseID)
            user_caseID = scan_caseID
            race = row['race']
            activity = row['activity']
            duration = row['duration']
            enroll = row['enroll']

            start_min = start_min % 1440
            stop_min = (start_min + duration) % 1440
            start_b = int(np.round(start_min / 30))
            stop_b = int(np.round(stop_min / 30))
            if start_b <= stop_b:
                period_list = list(range(start_b, stop_b + 1))
            else:
                period_list = list(range(start_b, 48)) + list(range(0, stop_b + 1))

            for period in period_list:
                temp = statistic_all.loc[(statistic_all['race'] == race)
                              & (statistic_all['enroll'] == enroll)
                              & (statistic_all['activity'] == activity),'b'+str(period)]
                statistic_all.loc[(statistic_all['race'] == race)
                              & (statistic_all['enroll'] == enroll)
                              & (statistic_all['activity'] == activity),'b'+str(period)] += 1
            print(user_caseID)

        else:
            if scan_caseID in ID_list:
                activity = row['activity']
                duration = row['duration']

                start_min = stop_min
                stop_min = (start_min + duration) % 1440
                start_min = start_min % 1440
                start_b = int(np.floor(start_min / 30))
                stop_b = int(np.floor(stop_min / 30))
                if start_b <= stop_b:
                    period_list = list(range(start_b, stop_b+1))
                else:
                    period_list = list(range(start_b,48)) + list(range(0,stop_b+1))

                for period in period_list:
                    statistic_all.loc[(statistic_all['race'] == race)
                                   & (statistic_all['enroll'] == enroll)
                                   & (statistic_all['activity'] == activity),'b' + str(period)] += 1

            elif scan_caseID not in ID_list:
                start_b, stop_b, start_min, stop_min = 0, 0, 240, 0
                ID_list.append(scan_caseID)
                user_caseID = scan_caseID
                race = row['race']
                activity = row['activity']
                duration = row['duration']
                enroll = row['enroll']

                start_min = start_min % 1440
                stop_min = (start_min + duration) % 1440
                start_b = int(np.round(start_min / 30))
                stop_b = int(np.round(stop_min / 30))
                if start_b <= stop_b:
                    period_list = list(range(start_b, stop_b+1))
                else:
                    period_list = list(range(start_b,48)) + list(range(0,stop_b+1))

                for period in period_list:
                    statistic_all.loc[(statistic_all['race'] == race)
                                  & (statistic_all['enroll'] == enroll)
                                  & (statistic_all['activity'] == activity),'b' + str(period)] += 1
                print(user_caseID)
    print(statistic_all)
    statistic_all.to_csv(name, encoding = 'utf-8',index = False)
    print('done')

    print('fig1 data processing is totally complete')
#fig1_data processing
def network_output_refine(filepath,name):
    data = pd.read_csv(filepath)
    outdata = []
    activity_list = []
    ID_list = []
    pick_list = [0,0,0,0]

    file = open(name, 'w+')
    writer = csv.writer(file)
    writer.writerow(('race','activities'))

    for index, row in data.iterrows():
        scan_caseID = row['caseID']
        if len(ID_list) == 0:
            ID_list.append(scan_caseID)
            user_caseID = scan_caseID
            race = row['race']
            activity = row['activity']
            duration = row['duration']
            activity_list.append(activity)
            activity_list.append(duration)
        else:
            if scan_caseID in ID_list:
                activity = row['activity']
                duration = row['duration']
                activity_list.append(activity)
                activity_list.append(duration)
            elif scan_caseID not in ID_list:
                # outdata.append(race,activity_list)
                activity_list = ','.join(str(x) for x in activity_list)
                if race == 3:
                    if random.uniform(0, 1) >= 0 and pick_list[race - 1] < 100:
                        writer.writerow((race, activity_list))
                        print('userID %d \'s information is complete' % user_caseID)
                        pick_list[race - 1] += 1
                elif random.uniform(0,1) >= 0.5 and pick_list[race-1] < 100:
                    writer.writerow((race, activity_list))
                    print('userID %d \'s information is complete' % user_caseID)
                    pick_list[race-1] += 1
                activity_list = []
                ID_list.append(scan_caseID)
                user_caseID = scan_caseID
                race = row['race']
                activity = row['activity']
                duration = row['duration']
                activity_list.append(activity)
                activity_list.append(duration)
    file.close()
    print('number of race picked',pick_list)
    print('fig1 data processing is totally complete')
#fig2_data processing
def histogram_output(filepath,name):
    data = pd.read_csv(filepath)
    file = open(name, 'w+')
    writer = csv.writer(file)
    writer.writerow(('race','enroll','activities','duration'))

    for index, row in data.iterrows():
        race = row['race']
        enroll = row['enroll']
        activity = row['activity']
        avg_duration = row['avg_duration']
        writer.writerow((race,enroll,activity,avg_duration))
    file.close()
    print('Histogram data input complete')
#fig3_data processing
def pie_output(filepath,name):
    data = pd.read_csv(filepath)
    file = open(name, 'w+')
    writer = csv.writer(file)
    writer.writerow(('race','activities','duration'))

    for index, row in data.iterrows():
        race = row['race']
        activity = row['activity']
        avg_duration = row['avg_duration']
        writer.writerow((race,activity,avg_duration))
    file.close()
    print('Pie data input complete')

if __name__ == '__main__':
    # activity_list = ['Sleeping', 'Grooming', 'Working and related activities', 'Educational Activities',
    #                  'Eating and Drinking', 'Leisure and Sports', 'Traveling', 'Other']
    # enroll_list = [3, 5]
    # network_output("fig2_2_raw.csv","line_chart_student.csv",activity_list)
    # activity_list = ['Working and related activities','Education with children','Other activities with children','Other']
    # enroll_list = [0]
    # network_output("fig2_3_raw.csv","line_chart_mother.csv",activity_list,enroll_list)

    # network_output_refine("fig1_raw.csv","network_refine.csv")
    # histogram_output("fig2_raw.csv","histogram.csv")
    pie_output("fig3_raw.csv", "pie.csv")