def post_processing_linechart(filepath,name):
    data = pd.read_csv(filepath)

    race_enroll_for_line_chart_student = [1458, 1289, 245, 325, 18, 16, 106, 126]
    race_for_line_chart_mother = [8829, 1651, 98, 719]

    enroll = data.loc[0,'enroll']
    if enroll == 0:
        for period in ['b' + str(x) for x in list(range(48))]:
            for race in list(range(1, 5)):
                temp = round(data.loc[(data['race'] == race), period] / race_for_line_chart_mother[race - 1],2)
                temp[temp >= 1] = 0.99
                data.loc[(data['race'] == race), period] = temp
    elif enroll != 0:
        for period in ['b' + str(x) for x in list(range(48))]:
            for race in list(range(1, 5)):
                temp = round(data.loc[(data['race'] == race) & (data['enroll'] == 3), period] / race_enroll_for_line_chart_student[2 * race - 2],2)
                temp[temp >= 1] = 0.99
                data.loc[(data['race'] == race) & (data['enroll'] == 3), period] = temp
                temp = round(data.loc[(data['race'] == race) & (data['enroll'] == 5), period] / race_enroll_for_line_chart_student[2 * race - 1],2)
                temp[temp >= 1] = 0.99
                data.loc[(data['race'] == race) & (data['enroll'] == 5), period] = temp
    data.to_csv(name, encoding = 'utf-8',index = False)

if __name__ == "__main__":
    import pandas as pd
    post_processing_linechart("line_chart_student.csv","line_chart_student_refine.csv")
    post_processing_linechart("line_chart_mother.csv", "line_chart_mother_refine.csv")